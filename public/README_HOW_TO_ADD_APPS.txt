========================================================================
极光OS · GUIDA SEMPLICE PER AGGIUNGERE LE TUE APP (/public/apps.json)
========================================================================

Nel file /public/apps.json bastano SOLO 3 RIGHE per ogni app:

[
  {
    "name": "2048 小游戏",
    "nameIt": "Gioco 2048",
    "url": "https://play2048.co/"
  },
  {
    "name": "Wikipedia",
    "url": "https://it.wikipedia.org"
  }
]

COSA SCRIVERE:
- "name": Nome dell'app (es. in cinese o originale)
- "nameIt": Nome in ITALIANO (opzionale, es. "Gioco 2048")
- "url": Il link del sito o gioco da aprire

TUTTO IL RESTO È AUTOMATICO:
- Icone: riconosciute in automatico dal nome o dal link (giochi, disegno, meteo, enciclopedie, musica, ecc.)
- Colori, categorie e grafica: assegnati automaticamente dal sistema!

Non serve specificare altro!
========================================================================
