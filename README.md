# planning

Page HTML autonome pour gerer un planning multi-restaurants.

Publication prevue via GitHub Pages.

## Synchronisation GitHub

La page charge les donnees partagees depuis `data/planning-data.json` au
demarrage. Elle peut aussi sauvegarder automatiquement les saisies dans ce
fichier via l'API GitHub.

### Mode equipe recommande

Le dossier `worker/` contient un backend Cloudflare Worker. Il garde le token
GitHub cote serveur et expose une API `/snapshot` pour la page.

Deploiement :

1. Copier `wrangler.toml.example` vers `wrangler.toml`.
2. Renseigner `ALLOWED_ORIGIN` si besoin.
3. Configurer les secrets :

   ```bash
   npx wrangler secret put GITHUB_TOKEN
   npx wrangler secret put TEAM_WRITE_KEY
   ```

4. Deployer :

   ```bash
   npx wrangler deploy
   ```

5. Dans la page, aller dans `Reglages` -> `Sync equipe`, coller l'URL du Worker
   et le code equipe. Apres connexion, les saisies sont synchronisees
   automatiquement.

Le token GitHub doit etre finement limite au depot `julienbenech-spec/planning`,
avec acces `Contents: Read and write`.

### Fallback GitHub direct

Pour saisir et synchroniser depuis un appareil :

1. Ouvrir la page Planning.
2. Aller dans `Reglages` -> `GitHub sync`.
3. Coller un token GitHub finement limite au depot `julienbenech-spec/planning`,
   avec acces `Contents: Read and write`.
4. Cliquer sur `Activer`.

Sans token, l'appareil peut charger les donnees publiques du depot, mais ses
saisies ne peuvent pas etre envoyees vers GitHub.

Attention : le depot `planning` est public. Les donnees sauvegardees dans
`data/planning-data.json` deviennent donc lisibles par toute personne qui a
l'URL du depot.
