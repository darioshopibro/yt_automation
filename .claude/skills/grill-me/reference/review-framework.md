# Review Framework — Sekcije za Plan Stress-Test

Prolazi kroz svaku sekciju redom. Preskoči sekcije koje nisu relevantne za plan.

---

## 1. Architecture & Dependencies

- Dependency graph — šta zavisi od čega?
- Single points of failure — šta ako X padne?
- Coupling analysis — da li promena u A zahteva promenu u B, C, D?
- Data flow — gde podaci ulaze, prolaze, izlaze? (ASCII dijagram)
- Scaling — šta se dešava na 10x, 100x load-u?
- Existing code leverage — da li nešto od ovoga VEĆ postoji u codebase-u?

**Pitaj:** "Nacrtaj mi tok podataka od ulaza do izlaza. Gde su shadow paths (nil, empty, error)?"

---

## 2. Feasibility & Effort

- Koliko je zapravo posla? (best case / worst case / realistic)
- Šta je najteži deo? Šta može da blokira?
- Da li zavisi od eksternog servisa/API-ja koji mi ne kontrolišemo?
- Da li zahteva znanje koje nemamo?
- Koje su alternative? (minimum 2 alternativna pristupa)

**Pitaj:** "Koji je najmanji mogući scope koji i dalje rešava problem?"

---

## 3. Edge Cases & Error Handling

- Šta ako input je prazan / null / ogroman / maliciozan?
- Šta ako korisnik uradi nešto neočekivano? (double-click, navigate away, timeout)
- Šta ako eksterna zavisnost ne odgovori / odgovori sporo / odgovori pogrešno?
- Šta ako se desi concurrent access?
- Race conditions?
- Šta ako se data promeni dok mi radimo sa njom?

**Pitaj:** "Nabroj mi top 5 načina na koji ovo može da pukne u produkciji."

---

## 4. Security & Trust Boundaries

- Gde su trust boundaries? (user input, external API, LLM output)
- Input validacija — šta propuštamo?
- Auth/authz — ko sme šta?
- Secrets management — gde čuvamo kredencijale?
- Injection vectors (SQL, command, prompt injection)

**Pitaj:** "Ako bih bio napadač, kako bih zloupotrebio ovaj sistem?"

---

## 5. Rollout & Rollback

- Kako deployujemo? (big bang vs. incremental vs. feature flag)
- Šta je rollback plan ako ne radi?
- Da li je deployment reverzibilan?
- Šta ako stara i nova verzija rade istovremeno?
- Kako verifikujemo da deploy radi? (smoke tests, health checks)

**Pitaj:** "Tačno opisi korake za rollback ako ovo eksplodira u 3 ujutru."

---

## 6. Observability & Debugging

- Kako ćemo znati da radi? (metrike, logovi, alerti)
- Kako ćemo znati da NE RADI? (failure detection)
- Ako se nešto pokvari za 3 nedelje — kako rekonstruišemo šta se desilo?
- Dashboard — šta prikazujemo dan 1?

**Pitaj:** "Zamis da je 3 ujutru i ovo ne radi. Šta gledaš prvo?"

---

## 7. Testing Strategy

- Šta testiramo? (unit / integration / e2e)
- Šta NE testiramo i zašto?
- Happy path ✓ — a failure path?
- Edge case coverage?
- "Da li bih bio siguran da ovo radi u petak u 2 ujutru?"

**Pitaj:** "Koji test bi napisao hostile QA engineer koji želi da ti nađe bug?"

---

## 8. Long-Term Impact

- Koliko technical debt ovo uvodi?
- Da li ovo otežava buduće promene?
- Da li nov čovek na projektu može da razume ovo za 30 minuta?
- Path dependency — da li nas ovo zaključava u nešto?
- Reversibility rating: 1 (lako promeniti) — 5 (zabetoniran si)

**Pitaj:** "Za 6 meseci — da li ćemo se kaiti zbog ove odluke? Zašto?"

---

## 9. Cost & Resources

- Koliko košta? (compute, API calls, storage, ljudski sati)
- Da li skalira cena linearno ili eksponencijalno?
- Da li postoji jeftinija alternativa koja je "dovoljno dobra"?
- ROI — kolika je vrednost u odnosu na ulaganje?

**Pitaj:** "Da li bismo platili X za ovo da nije naš projekat?"

---

## 10. User Impact & UX (ako je relevantno)

- Šta korisnik vidi / oseti?
- Empty states, loading states, error states — sve pokriveno?
- Da li je ovo intuitivno ili zahteva objašnjenje?
- Accessibility basics (keyboard, screen reader, contrast)

**Pitaj:** "Pokaži mi najgori mogući user journey kroz ovo."
