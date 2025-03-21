# Krossaspurningasíða
_HBV403G Vefforritun 2 - Einstaklingsverkefni 2_

Annað einstaklingsverkefnið í HBV403G Vefforritun 2. Geymir spurningar í gagnagrunni og notar express með templates til að birta. Nánari verkefnalýsingu má finna [hér](https://github.com/vefforritun/vef2-2025-v2).

## Hýsing
Verkefninu er hýst [hér](https://hbv403g-vef2-ev2-pls.onrender.com/).

## Uppsetning
Verkefnið krefst `Node.js` útgáfu 22.
Hægt er að setja upp verkefnið með því að gera 
```bash
npm install
```

### Keyrsla
Til þess að keyra verkefnið og búa til `HTML` skrárnar, þarf að gera 
```bash
npm run build
```

Skrárnar eru settar í [dist](dist/) möppuna.

### Prófanir
Prófanirnar notast við Vitest útgáfu 3.
Til þess að keyra prófanir þarf að gera 
```bash
npm run test
```
Einnig er hægt að sjá `coverage` með því að gera
```bash
npm run coverage
```
Ath. að sumar prófanir eiga það til að virka ekki þegar coverage er notað.
