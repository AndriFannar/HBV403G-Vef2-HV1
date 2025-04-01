# Kröfugreiningarforrit
_HBV403G Vefforritun 2 - Einstaklingsverkefni_

Einstaklingsverkefnið í HBV403G Vefforritun 2, þar sem ákveðið var að búa til bakenda sem sér um að skrásetja kröfur ( aðiens Use Cases hingað til) verkefna. Notar Hono til að útfæra REST-ful API, og notar Prisma til að geyma gögn. Nánari verkefnalýsingu má finna [hér](https://github.com/AndriFannar/HBV403G-Vef2-EV).

## Hýsing
API má finna [hér](https://hbv403g-vef2-ev2-pls.onrender.com).

## Hönnun
Hægt er að skoða hönnun forritsins [hér](designDocs/Design.png)

## Uppsetning
Verkefnið krefst `Node.js` útgáfu 22.
Hægt er að setja upp verkefnið með því að gera 
```bash
npm ic
npm run build
```

### Keyrsla
Til þess að keyra verkefnið þarf að gera
```bash
npm run start
```

Þýddu skrárnar má finna í [build](build/) möppunni.

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
