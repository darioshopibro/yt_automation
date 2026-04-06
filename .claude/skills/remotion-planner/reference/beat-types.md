# Beat Types — Pravila i Tabela

**Za SVAKI segment odluči beat tip:**

| Beat tip | Kad se koristi | Šta planner radi |
|----------|---------------|-------------------|
| `motion_graphics` | Objašnjava koncept, pokazuje flow, poredi opcije | Pokreni visual-generator skill |
| `ai_video` | Hook (uvek prvi), dramatičan reveal, šokantan stat | Zapiši `aiVideoPrompt` u master-plan |
| `meme` | Humor, reakcija, relatable momenat | Zapiši `meme` info u master-plan |

**Pravila za beat tipove:**
- **Prvi segment = `ai_video`** (uvek — dramaturški hook)
- `ai_video` koristi umereno — skupi su za generisanje
- `meme` koristi gde ima smisla — ne forsiraj
- **Ostatak = `motion_graphics`** (core content)
- Ako postoji `memes_{slug}.json` u workspace/ → pročitaj i koristi za meme odluke
- Ako postoji `ai-clips/` u workspace/ → proveri šta je već generisano
- Ti odlučuješ koliko čega treba — nema hardkodiranih limita

**Meme odluke:** Čitaj `workspace/{project-name}/memes_*.json` ako postoji. Biraj meme koji se TEMATSKI uklapa u segment. Ne forsiraj meme gde ne ide.
