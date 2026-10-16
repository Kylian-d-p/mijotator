# Mijotator

## Présentation

Mijotator compose les repas de la semaine et la liste de courses qui va avec.

L'utilisateur connecté indique ses contraintes : nombre de personnes, budget, régime et allergies, temps de préparation maximal, et les repas à prévoir, cochés jour par jour (midi, soir ou les deux) sur un planning de sept jours. Il ajoute ce qu'il reste dans son frigo. Un modèle d'IA hébergé propose alors un repas par créneau, avec ses ingrédients et ses étapes. L'application en tire une liste de courses regroupée par rayon, dont elle retire ce que le frigo contient déjà. La liste se coche en direct : au magasin sur le téléphone, et l'ordinateur suit sans rechargement.

Pour qui : celles et ceux qui font leurs courses une fois par semaine et veulent arrêter de se demander « on mange quoi ce soir ? », sans gaspiller ce qui traîne au frigo.

## Adresse de production

À compléter après le premier déploiement : `https://<projet>.vercel.app`

Vidéo de démonstration : à compléter.

## Architecture

```
Navigateur ──POST /api/semaines──▶ session, validation, quota (Redis), semaine « en_attente »
                                     │
                                     ▼ publication
                                   QStash ──▶ /api/jobs/generer-semaine (signature vérifiée)
                                                │  Groq → vérification → liste de courses
                                                │  repas + articles enregistrés, semaine « prête »
                                                ├──▶ Resend : menu et liste par e-mail
Navigateur ◀── Supabase Realtime ───────────────┘  (la page de la semaine se met à jour)
```

| Service | Rôle |
|---|---|
| Next.js 16 sur Vercel | Pages, routes API et worker de génération (fonctions serverless) |
| Groq | Modèle d'IA, appelé côté serveur uniquement |
| Supabase Database | Semaines, repas et listes de courses, avec Row Level Security |
| Supabase Auth | Connexion par lien magique, sans mot de passe |
| Upstash Redis | Limitation de débit : 5 semaines par heure et par utilisateur |
| `/admin` | Contrôle de chaque service, réservé aux adresses de `ADMIN_EMAILS` |

### Briques au choix

| Brique | Pourquoi elle sert ici |
|---|---|
| **Génération asynchrone (Upstash QStash)** | La génération est rapide (2 à 3 s), mais elle échoue parfois de façon passagère. Groq rejette sa propre sortie (`400 json_validate_failed`, 2 appels sur 15 pendant la mise au point), et le palier gratuit (8 000 tokens par minute pour la clé entière, tous utilisateurs confondus) renvoie des `429` en cas de pic. La route répond tout de suite, et le worker vérifie la signature et reste idempotent. QStash le relance jusqu'à 3 fois. |
| **Temps réel (Supabase Realtime)** | Deux usages. La page d'une semaine attend la fin de la génération sans rechargement. Surtout, la liste de courses cochée sur un écran se met à jour sur les autres : c'est l'usage au supermarché. |
| **Notifications par e-mail (Resend)** | Quand la semaine est prête, l'utilisateur reçoit le menu et la liste de courses par e-mail, consultables au magasin même sans réseau. Il est aussi prévenu en cas d'échec définitif. Un envoi raté est journalisé, mais ne fait pas échouer la génération. |

Briques supplémentaires, reprises de l'architecture des TD et contrôlées dans `/admin` :

- **Sentry** : erreurs du navigateur et du serveur, avec l'environnement.
- **Langfuse** : chaque appel au modèle est tracé, avec ses tokens, sa latence et son coût.
- **UptimeRobot** : surveillance externe de `/api/health`.
- **Infisical** : secrets centralisés, injectés en local et synchronisés vers Vercel.

### Porte de qualité

`vercel.json` remplace la commande de build : `npm run verifier && next build`. La commande `verifier` enchaîne ESLint, la vérification des types (`tsc --noEmit`) et les tests Vitest. Un déploiement dont le code ne passe pas ces étapes échoue avant `next build`.

## Modèle d'IA

**Groq, `openai/gpt-oss-20b`**, avec `reasoning_effort: low`.

Pourquoi ce choix :

- **Gratuit, sans carte bancaire**, et compatible avec l'API d'OpenAI (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`).
- **Sortie structurée** (`json_schema` en mode strict). Le mode strict accepte les `enum` (unités, rayons, moments), les entiers et `minItems`/`maxItems`.
- **Rapide et économique**. Mesures sur 15 appels :

| Demande | Durée | Tokens (entrée / sortie) | Coût |
|---|---|---|---|
| 7 soirs | 1,9 à 2,4 s | ~0,9k / 1,2k à 1,8k | ~0,0005 $ |
| 14 repas (midi et soir) | 2,5 à 3,3 s | ~0,9k / 2,2k à 2,8k | ~0,0008 $ |

La consigne a été mise au point en cinq versions, testées contre Groq. Ce qui en est sorti :

- **Le frigo est relevé par le modèle** (champ `frigo`, avec quantités), **puis soustrait par le code**. Avec un simple booléen par ingrédient, le modèle prenait 18 œufs dans un frigo qui en contenait 6.
- **Le régime passe avant le frigo.** Sans cette règle, la crème fraîche du frigo finissait dans des repas sans lactose.
- **Sel, poivre, huile et eau sont retirés de la liste par le code**, car le modèle liste parfois l'huile d'olive malgré la consigne.
- **`max_completion_tokens` est fixé à 6 000.** Sans limite explicite, une semaine de 14 repas était tronquée vers 1 850 tokens.
- **La vérification rejette moins de 3 étapes par repas.** Un essai n'a renvoyé que « Sers chaud. ».

Groq vérifie la réponse *après* l'avoir générée. La génération est donc retentée une fois en cas d'erreur de format (`src/lib/generer-semaine.ts`). Si la seconde tentative échoue aussi, le worker répond en erreur et QStash relance la génération : ces échecs sont aléatoires (3 appels sur 17 lors d'un test du 16 octobre, dont deux d'affilée), donc une semaine ne passe plus en erreur sur deux tirages malchanceux.

## Structure de données

Script versionné : [`supabase/schema.sql`](supabase/schema.sql), pour une base neuve. Une base créée avant le choix libre des repas se met à jour avec [`supabase/migration-creneaux.sql`](supabase/migration-creneaux.sql).

```
semaines 1──n repas
         1──n articles_courses
```

| Table | Contenu |
|---|---|
| `semaines` | Contraintes saisies (`debut`, `personnes`, `budget_euros`, `regime`, `temps_max_minutes`, `creneaux`, `frigo`). `creneaux` liste les repas à prévoir sous la forme « jour-moment » (`1-soir`, `3-midi`…), vérifiés par une contrainte `check`, `statut` (`en_attente`, `prete`, `erreur`), `frigo_releve`, `cout_estime`, `modele` |
| `repas` | `semaine_id` → `semaines`, `jour` (1 à 7), `moment` (`midi`, `soir`), `titre`, `temps_minutes`, `ingredients` (JSON), `etapes`. Unicité (`semaine_id`, `jour`, `moment`) |
| `articles_courses` | `semaine_id` → `semaines`, `nom`, `quantite`, `unite` (`g`, `ml`, `piece`), `rayon`, `coche` |

Chaque table porte `user_id`, et la suppression d'une semaine supprime ses repas et ses articles (`on delete cascade`).

**Règles de sécurité**

- **Row Level Security sur les trois tables.** Un utilisateur ne lit que ses propres lignes.
- **Création d'une semaine**, avec ses seules contraintes. Les droits par colonne laissent `user_id` et `statut` à leur valeur par défaut : impossible de créer une semaine déjà « prête ».
- **Repas, articles, statut et résultats sont écrits par le worker** avec le client administrateur (clé secrète). C'est le seul traitement sans utilisateur connecté, et aucune politique ne permet à un utilisateur d'écrire ces données.
- **Dans la liste de courses, seule la colonne `coche` est modifiable**, par son propriétaire (RLS et `grant update (coche)`).
- **Temps réel** : les tables `semaines` et `articles_courses` font partie de la publication `supabase_realtime`. Les événements respectent la RLS.

## Lancer le projet en local

**Prérequis** : Node.js 20 ou plus récent, et un projet sur chaque service : Supabase, Groq, Upstash (Redis et QStash), Resend. Sentry, Langfuse, UptimeRobot et Infisical sont facultatifs en local.

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Copier `.env.example` vers `.env.local` et le remplir, ou utiliser Infisical : `infisical init`, puis `npm run dev:secrets`.
3. Dans le SQL Editor de Supabase, exécuter `supabase/schema.sql`. Dans Authentication → URL Configuration, ajouter `http://localhost:3000/auth/callback` aux adresses de redirection.
4. Lancer QStash en local, puis reporter dans `.env.local` l'adresse et les clés qu'il affiche (`QSTASH_URL`, `QSTASH_TOKEN`, clés de signature) :
   ```bash
   npx @upstash/qstash-cli dev
   ```
5. Lancer l'application :
   ```bash
   npm run dev
   ```

Vérifier avant chaque envoi :
```bash
npm run verifier
```

**Variables d'environnement**

| Variable | Rôle |
|---|---|
| `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL` | Fournisseur et modèle d'IA |
| `AI_REASONING_EFFORT` | Effort de raisonnement des modèles qui raisonnent (`low` conseillé) |
| `AI_PRIX_ENTREE_PAR_MILLION`, `AI_PRIX_SORTIE_PAR_MILLION` | Prix du modèle, pour le coût affiché dans Langfuse |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Projet Supabase (côté navigateur) |
| `SUPABASE_SECRET_KEY` | Clé secrète, utilisée seulement par le worker et `/admin` |
| `ADMIN_EMAILS` | Adresses autorisées sur `/admin`, séparées par des virgules |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Limitation de débit |
| `APP_URL` | Adresse publique de l'application, où QStash livre les messages |
| `QSTASH_URL`, `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` | File de génération et vérification des signatures |
| `RESEND_API_KEY` | Envoi des e-mails |
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | Suivi des erreurs et envoi des source maps au build |
| `UPTIMEROBOT_API_KEY` | Contrôle de la surveillance dans `/admin` |
| `LANGFUSE_BASE_URL`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` | Traces des appels au modèle |

## Limites et améliorations possibles

**Limites connues**

- **Le coût estimé n'est qu'indicatif.** Pour la même demande, le modèle a annoncé de 5,5 € à 68,5 €.
- **Un frigo bien rempli rend la semaine répétitive** : par exemple des courgettes sept soirs sur sept.
- **Un même produit dans deux unités reste sur deux lignes** de la liste (« oignon : 1 » et « oignon : 100 g »). Il n'y a pas de conversion entre pièces et grammes.
- **Les régimes et les allergies reposent sur le modèle.** L'application rappelle de vérifier les allergènes, mais ne les contrôle pas elle-même.
- **Le quota gratuit de Groq est partagé par tous les utilisateurs.** Au-delà de deux ou trois semaines générées par minute, les demandes attendent les nouvelles tentatives de QStash.
- **Une liste n'est visible que par son auteur.** Il n'y a pas de partage entre les membres d'un foyer.

**Améliorations possibles**

- Remplacer un seul repas sans regénérer la semaine.
- Partager une semaine et sa liste au sein d'un foyer (table `foyers` et membres, RLS adaptée).
- Envoyer un rappel planifié le samedi matin avec la liste de la semaine suivante.
- Protéger le formulaire de connexion par une vérification anti-robot invisible.
- Supprimer ou dupliquer une semaine.
