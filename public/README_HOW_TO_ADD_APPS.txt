========================================================================
极光OS · GUIDA AGGIUNTA APP ESTERNE CON NOME IN ITALIANO
========================================================================

Puoi configurare le app esterne direttamente nel file /public/apps.json!
Supporta sia il nome originale (cinese o inglese) che il nome in italiano ("nameIt"):

[
  {
    "name": "Nome Cinese o Internazionale",
    "nameIt": "Nome dell'App in Italiano",
    "subName": "Descrizione o sottotitolo",
    "url": "https://link-del-sito.com",
    "icon": "Gamepad2",
    "category": "游戏娱乐"
  }
]

Campi disponibili:
- "name": Nome principale visualizzato (es: "2048 小游戏")
- "nameIt": Nome in ITALIANO (es: "Gioco 2048") -> Mostrato chiaramente sotto l'icona!
- "url": Il link HTTPS della web application
- "icon": Icona tra quelle disponibili (Globe, Gamepad2, Palette, Music, Video, Code, ecc.)
- "category": Categoria (工具, 游戏娱乐, 创意工具, 学习百科)

Se inserisci solo "name" e "url", il telefono genera tutto il resto automaticamente!
Puoi anche aggiungere nuove app direttamente dal telefono aprendo "应用市场" (App Market).
========================================================================
