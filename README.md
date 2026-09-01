# planning

Page HTML autonome pour gerer un planning multi-restaurants.

Publication prevue via GitHub Pages.

## Synchronisation GitHub

La page peut sauvegarder automatiquement les donnees dans `data/planning-data.json`
via l'API GitHub.

Sur chaque appareil :

1. Ouvrir la page Planning.
2. Aller dans `Reglages` -> `GitHub sync`.
3. Coller un token GitHub finement limite au depot `julienbenech-spec/planning`,
   avec acces `Contents: Read and write`.
4. Cliquer sur `Activer`.

Attention : le depot `planning` est public. Les donnees sauvegardees dans
`data/planning-data.json` deviennent donc lisibles par toute personne qui a
l'URL du depot.
