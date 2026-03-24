# Available Layouts (9)

Svaka sekcija MORA imati `layout` property. Template pokazuje primer.

| Layout | Vizual | Koristi za |
|--------|--------|------------|
| `flow` | A → B → C | pipeline, sekvenca (DEFAULT) |
| `arrow` | A → B | jednostavna veza |
| `vs` | A vs B | poređenje |
| `combine` | A + B = C | kombinacija |
| `negation` | ✗A → B | loše → dobro |
| `bidirectional` | A ↔ B | dvosmerna veza |
| `filter` | A ▷ B | filtriranje |
| `if-else` | A → [B, C] | split/branch |
| `merge` | [A, B] → C | spajanje |

**Default:** Ako ne znaš koji → `"flow"`
