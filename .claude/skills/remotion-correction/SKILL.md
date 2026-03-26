# Remotion Correction Skill

Brze korekcije generisanog videa — menja `dynamic-config.json` u projektu. Nema rebuild, nema planner/builder ponovo. Remotion hot-reload = instant preview.

**Trigger:** "popravi", "promeni ikonu", "zameni", "prebaci layout", "dodaj node", "obriši", "promeni boju", "korekcija", "fix"

---

## KRITIČNO: ŠTA OVAJ SKILL RADI

```
✅ Čita CURRENT dynamic-config.json iz projekta
✅ Radi SAMO traženu promenu
✅ Auto-backup pre svake promene
✅ Save → Remotion hot-reload → instant

❌ NE pokreće planner/builder
❌ NE menja .tsx fajlove
❌ NE regeneriše voiceover (za to koristi voice-correction tools)
❌ NE generiše novi config od nule
```

---

## KORAK 1: Odredi projekat

User mora reći koji projekat. Ako ne kaže, pitaj.

```
Config fajl: /Users/dario61/Desktop/YT automation/{project-path}/src/dynamic-config.json
```

Primeri:
- `videos/blue-green-deploy` → `videos/blue-green-deploy/src/dynamic-config.json`
- `videos/kubernetes` → `videos/kubernetes/src/dynamic-config.json`

## KORAK 2: Pročitaj CURRENT config

```bash
cat {project-path}/src/dynamic-config.json
```

**UVEK čitaj CURRENT stanje!** Možda je user već ručno menjao config.

## KORAK 3: Auto-backup

Pre SVAKE promene, sačuvaj backup:
```bash
cp {project-path}/src/dynamic-config.json {project-path}/src/dynamic-config.backup.$(date +%H%M%S).json
```

## KORAK 4: Napravi traženu promenu

Edituj SAMO ono što je traženo. Primeri:

### Promeni ikonu
```
User: "zameni ikonu Manual sa Hammer"
→ Nađi node gde label="Manual", promeni icon u "Hammer"
```

### Promeni boju noda
```
User: "Blue node treba da bude plav"
→ Nađi node gde label="Blue", dodaj "color": "blue"
```

### Promeni layout sekcije
```
User: "CI Pipeline sekcija treba da bude vs umesto flow"
→ Nađi section gde title="CI Pipeline", promeni layout u "vs"
```

### Dodaj node
```
User: "dodaj Deploy node posle Test u CI Pipeline"
→ Nađi section "CI Pipeline", dodaj node u nodes array posle "Test"
→ Pitaj za ikonu ili koristi batch_icons.py
```

### Obriši node
```
User: "obriši Rare node"
→ Nađi node gde label="Rare", ukloni iz array-a
```

### Promeni sticky boju
```
User: "Step 2 treba da bude zelen"
→ Nađi sticky gde step=2, promeni color u "#22c55e"
```

### Promeni label
```
User: "promeni Break u Crash"
→ Nađi node gde label="Break", promeni u "Crash"
```

### Promeni startFrame (timing)
```
User: "Gate sekcija treba da se pojavi kasnije, na frame 1000"
→ Nađi section "Gate", promeni startFrame u 1000
```

## KORAK 5: Save i potvrdi

Sačuvaj editovani config. Remotion hot-reload pokupi promenu automatski.

Reci useru: "Promenjeno: [šta]. Backup: [backup fajl]. Refreshuj preview."

---

## DOSTUPNE BOJE

Za nodove (color field):
```
blue, green, orange, purple, red
```

Za sticky-je (hex):
```
#ef4444 (red), #3b82f6 (blue), #06b6d4 (cyan), #22c55e (green), #a855f7 (purple), #f97316 (orange)
```

## DOSTUPNI LAYOUTI

```
flow, arrow, vs, combine, negation, if-else, merge, bidirectional, filter
```

## IKONE

1512 Phosphor ikona, PascalCase. Ako user ne zna tačan naziv:
```bash
python3 /Users/dario61/Desktop/YT\ automation/templates/icon-search/find_icon.py "concept" --top 5
```

## VIŠESTRUKE PROMENE

User može tražiti više promena odjednom:
```
"zameni Manual ikonu sa Hammer, prebaci CI Pipeline na vs, i obriši Rare node"
```
→ Uradi SVE promene u jednom editu, jedan backup, jedan save.
