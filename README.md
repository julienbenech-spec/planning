# planning

Page HTML autonome pour gerer un planning multi-restaurants.

Publication prevue via GitHub Pages.

## Synchronisation GitHub

La page charge les donnees partagees depuis `data/planning-data.json` au
demarrage. Elle peut aussi sauvegarder automatiquement les saisies dans ce
fichier via l'API GitHub.

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
