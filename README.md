# Anime Fitness

Telefonra optimalizált edzés-, tanulás- és napló-tracker anime RPG játékelemekkel: XP, szintek, streak, napi questek, karakterosztályok és evolúció.

**Élő verzió:** https://jtdevzero.github.io/Edzi/

## 1. ütem (kész)
- Karakter: 5 anime osztály (Hős, Árnyvadász, Démonvadász, Felderítő, Szerzetes), minden 5. szinten új cím
- Naplózás: edzés / tanulás / napló, időtartam és intenzitás alapján XP
- Anime edzéssablonok, gyakorlatonként „Hogyan csináld” YouTube kereséssel
- Napi 3 quest (fizikai, szellemi, regeneráció)
- Streak bónusz: 3 nap ×1.1, 7 nap ×1.2, 14 nap ×1.5
- Előzmények törléssel. Minden érték a bejegyzésekből számolódik, így a törlés után is pontos marad
- Az adat a böngészőben tárolódik (nincs fiók, nincs szerver)

## 2. ütem
- **A (kész):** adatmentés fájlba és visszatöltés, rendes app ikon, teljes képernyős mód a főképernyőről, Statisztika fül (12 hetes naptár, heti XP, rekordok), streak-védő (hetente 1 pihenőnap)
- **B (kész):** 22 jelvény, heti cél (+50 XP bónusz), kihívás programok (Saitama 30 nap, GtG húzódzkodás 4 hét, Démonvadász légzés 14 nap)
- **C (kész):** edzésmód (sorozatszámláló, pihenő időzítő, stopper, intervallum, hangjelzés, képernyő ébren tartása, újratöltés-biztos), pomodoro a tanuláshoz, gyakorlatonkénti rekordok és fejlődés grafikon

## Fejlesztés
```bash
cd mobile
npm install
npm run web        # böngészőben
npm test           # játéklogika tesztek
npm run build:web  # statikus build a dist/ mappába
```
Push a `main` branchre → a GitHub Action buildel és kiteszi a `gh-pages` branchre.

## Következő ütemek
2. Finomítás valós használat alapján (XP egyensúly, grafikonok, adatmentés fájlba, kezdőképernyő-ikon)
3. AI: Claude karakter fotóból, AI questek, sensei coach (a `backend/` mappa ehhez van előkészítve)
4. Szinkron több eszköz között (Supabase)
5. Natív iOS app (Expo EAS → TestFlight → App Store)
