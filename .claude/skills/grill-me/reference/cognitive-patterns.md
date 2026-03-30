# Cognitive Patterns — Kako razmišljati tokom grillovanja

Koristi ove mentalne modele dok evaluiraš plan. Ne moraju svi biti relevantni za svaki plan.

---

## Decision Classification (Bezos)

**One-way door** — teško reverzibilna odluka. Uspori, razmisli dobro.
**Two-way door** — lako promeniti. Brzo odluči, koriguj later.

→ Za svaku odluku u planu: "Da li je ovo one-way ili two-way door?"

---

## Inversion (Munger)

Umesto "Kako da uspemo?" → **"Kako da sigurno propanemo?"**

Nabroj 5 načina da ovaj plan garantovano propadne. Onda proveri da li plan adresira ijedan od njih.

---

## Focus as Subtraction (Jobs)

"Fokus znači reći NE stotinama dobrih ideja."

→ Pitaj: "Šta bismo IZBACILI iz ovog plana a da i dalje rešava problem?"

---

## Pre-Mortem (Gary Klein)

Zamisli da je prošlo 3 meseca i plan je KATASTROFALNO PROPAO.
- Šta je pošlo po zlu?
- Koji signal smo ignorisali?
- Koji dependency je pukao?

Ovo povećava identifikaciju problema za 30% u odnosu na "šta može poći naopako?"

---

## Irreversibility × Blast Radius × Likelihood

Za svaki rizik:
- **Irreversibility** (1-3): Koliko je teško poništiti?
- **Blast Radius** (1-3): Koliko sistema/korisnika pogađa?
- **Likelihood** (1-3): Koliko je verovatno?

Score = I × B × L (max 27). Fokusiraj se na sve iznad 12.

---

## Minimum Viable Decision

Ne moraš rešiti sve odjednom.
- Koje odluke MORAJU biti donete sad?
- Koje mogu biti odložene dok ne imamo više informacija?
- Koje su reverzibilne pa nisu bitne sad?

---

## Second-Order Effects

Za svaku promenu u planu:
1. **Prvo:** Šta se direktno menja?
2. **Drugo:** Šta se menja KAO POSLEDICA toga?
3. **Treće:** Šta se menja kao posledica posledice?

Većina planova razmišlja samo o prvom redu.

---

## Proxy Skepticism

Da li merimo pravu stvar ili proxy?
- "Lines of code" ≠ productivity
- "Number of features" ≠ value
- "Test coverage %" ≠ quality

→ Za svaku metriku u planu: "Da li ovo zapravo meri ono što mislimo?"

---

## Leverage Obsession

Gde je 20% efforta koji donosi 80% rezultata?

→ "Koji je JEDAN element ovog plana koji, ako ga uradimo savršeno, čini sve ostalo lakšim?"

---

## Completeness is Cheap (AI era)

Kad AI kompresuje implementaciju 10-100x:
- Pristup A (kompletno, ~150 LOC) vs Pristup B (90%, ~80 LOC)
- UVEK preferiraj A. Delta od 70 linija košta sekunde sa AI.

→ Ne pravi shortcut-ove samo da uštediš vreme. Ship celo rešenje.
