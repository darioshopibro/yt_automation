# Timing Rules + Examples

## TIMING RULES

| Element | Timing |
|---------|--------|
| Camera keyframe | 15 frames PRE sekcije |
| Element appear | 3-5 frames PRE reči |
| Sound (camera) | 2 frames PRE camera keyframe |
| Sound (section) | 20+ frames POSLE camera |
| Stagger između nodes | +4-6 frames |

---

## PRIMER 1: RAG Pipeline (STICKY)

**Input tekst:**
> "A user sends a query. That query gets converted into embedding. You search vector database. That's step one, retrieve."

**Analiza:**
- hierarchyType: "sticky" (ima korake)
- Step 1 sadržaj POČINJE sa "A user sends a query" (NE sa "step one")
- StickyNote se pojavi 5 frames PRE prve reči o tom sadržaju

**KRITIČNO - Frame timing:**
```
Tekst: "A user sends a query... That's step one, retrieve."

"A user" = reč #1 @ frame 100    ← OVDE počinje SADRŽAJ step 1!
"step one" = reč #45 @ frame 508  ← Ovo je samo potvrda, NE početak!

StickyNote "Step 1: Retrieve" se pojavi na frame ~95
(5 frames PRE "A user", NE na frame 500+!)
```

**Camera plan:**
- Frame 0: Overview (title visible)
- Frame ~85: Zoom to Step 1 (15 frames pre "user" @ frame 100)
- Frame ~340: Zoom to Step 2 (kad priča o augment)

**Sound plan:**
- Frame 0: title whoosh (0.15)
- Frame 83: camera whoosh (0.25)
- Frame 105: section whoosh (0.12) - 20+ frames posle camera

---

## PRIMER 2: Tech Stack (FLAT)

**Input tekst:**
> "This is the NemoClaw stack. OpenShell. Policy Engine. Privacy Router."

**Analiza:**
- hierarchyType: "flat" (NEMA korake!)
- Nema "step 1, step 2" - nezavisni koncepti
- Kratak tekst, flat struktura

**Struktura (FLAT - bez StickyNote wrapper-a):**
```json
{
  "hierarchyType": "flat",
  "sections": [
    { "title": "OpenShell", "nodes": [{ "label": "Runtime", "icon": "Terminal" }] },
    { "title": "Policy Engine", "nodes": [{ "label": "Rules", "icon": "Shield" }] },
    { "title": "Privacy Router", "nodes": [{ "label": "Filter", "icon": "Lock" }] }
  ]
}
```

**Camera:** Pomera se između SectionBox-ova (ne StickyNotes)
