# Branding Setup Skill

Setup i upravljanje brand konfiguracijom za video projekte. Svaki brend ima boje, logo, font, stil, intro/outro. Svi videi i editor koriste aktivni brend.

**Trigger:** "setup brand", "napravi brend", "branding", "promeni boje", "dodaj logo", "brand setup", "setuj stil"

---

## FLOW

### 1. Proveri postojece brendove
```bash
ls brands/
```
Ako `brands/` ne postoji ili je prazan — ovo je prvi setup.

### 2. Pitaj usera

**Obavezna pitanja:**
- "Kako se zove kanal/brend?"
- "Koja ti je glavna boja?" (hex ili opis: 'plava', 'cyber-zelena', 'topla narandzasta')
- "Hoces logo? Daj path do fajla (PNG/SVG)"

**Opciona pitanja:**
- "Koji font preferiras? (modern, monospace, clean, techy)"
- "Imas intro/outro video? Daj path ili skip"
- "Imas screenshot dizajna koji ti se svidja?" — ako da, analiziraj

### 3. Screenshot analiza (ako user posalje)

Kad user posalje screenshot:
1. Analiziraj boje — izvuci dominantne boje iz slike
2. Analiziraj stil — borderi (da/ne), border-radius, glassmorphism, shadows
3. Odredi: flat vs glass, rounded vs sharp, bordered vs borderless
4. Generiši `style` sekciju u brand.json koja matchuje screenshot

**Primeri:**
- Flat dizajn bez bordera → `stickyBorder: false, glass.enabled: false, shadow: false`
- Neon glow → `glass.glowIntensity: 1.5, shadow: true`
- Zaobljeni kartoni → `stickyBorderRadius: 32, sectionBorderRadius: 24`

### 4. Generiši brand.json

Lokacija: `brands/{slug}/brand.json`

Slug = ime brenda, lowercase, kebab-case (npr. "My Tech Channel" → "my-tech-channel")

```json
{
  "name": "Brand Name",
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#030305",
    "backgroundGradient": "radial-gradient(...)",
    "text": "#f8fafc",
    "textMuted": "#94a3b8",
    "stickyColors": ["#hex1", "#hex2", "#hex3", "#hex4"]
  },
  "logo": {
    "path": "logo.png",
    "watermarkPosition": "bottom-right",
    "watermarkOpacity": 0.3
  },
  "font": {
    "heading": "font-family string",
    "body": "font-family string",
    "code": "font-family string"
  },
  "style": {
    "stickyBorder": true,
    "stickyBorderRadius": 20,
    "stickyBorderWidth": 1.5,
    "stickyBorderStyle": "solid",
    "sectionBorder": true,
    "sectionBorderRadius": 20,
    "glass": {
      "enabled": true,
      "blur": 16,
      "borderOpacity": 0.37,
      "glowIntensity": 1.0
    },
    "nodeShape": "rounded",
    "nodeIconSize": 56,
    "connectorStyle": "arrow",
    "shadow": true,
    "backgroundPattern": "none"
  },
  "intro": { "videoPath": "" },
  "outro": { "videoPath": "" }
}
```

### 5. Kopiraj assets
```bash
cp user-logo.png brands/{slug}/logo.png
cp user-intro.mp4 brands/{slug}/intro.mp4  # ako postoji
```

### 6. Reci useru
"Brand '{name}' kreiran! Otvori localhost:3002 → Branding tab da vidis preview i fine-tune-ujes boje/stil."

---

## BOJA IZ OPISA

Kad user kaze opis umesto hex:
- "plava" / "blue" → primary: #3b82f6
- "zelena" / "green" → primary: #10b981
- "crvena" / "red" → primary: #ef4444
- "narandzasta" / "orange" → primary: #f97316
- "ljubicasta" / "purple" → primary: #a855f7
- "cyber" / "neon" → primary: #06b6d4, glass.glowIntensity: 1.5
- "topla" / "warm" → primary: #f59e0b, secondary: #f97316
- "dark" / "minimal" → background: #000000, glass.enabled: false

Na osnovu primary boje, automatski generiši komplementarne boje za secondary, accent, i stickyColors.

---

## PRE-FLIGHT CHECK

Pre svakog `remotion-planner` ili `remotion-builder` poziva:
1. Proveri da li `brands/` postoji i ima bar 1 brend
2. Ako nema — pitaj usera: "Nemas nijedan brend setovan. Hoces da ga setupujemo sad?"
3. Ako ima — koristi default ili pitaj koji brend da koristi

---

## EDIT EXISTING BRAND

User moze reci:
- "Promeni primary boju na crvenu" → edituj brands/{slug}/brand.json
- "Ukloni bordere" → style.stickyBorder = false, style.sectionBorder = false
- "Dodaj logo" → kopiraj fajl u brands/{slug}/
- "Prebaci na flat dizajn" → glass.enabled = false, shadow = false
