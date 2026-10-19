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

## Hibrid fitnesz + RPG bővítés (fejlesztési ág)

- **Stabilizálás:** helyi mentés/import szigorúbb ellenőrzése, v1→v2 állapotmigráció, edzéshez kötött programnap-jutalom visszavonása törléskor. A backend tokennel védett és ismert originre korlátozott, de még **nem többfelhasználós, éles API**.
- **Fitnesz Pro:** testsúly és körfogatok rögzítése a Statisztika fülön, testsúlygrafikon, önkéntes céltestsúly, súlyzós gyakorlatok kg + ismétlés alapú sorozatai, rekordok és összes mozgatott tömeg. A régi, csak ismétlést tároló edzések változatlanul olvashatók.
- **Anime RPG 2.0:** három heti hőspróba (edzésnapok, edzéspercek, szellemi fókusz), automatikusan újraszámolt XP, D–S karakterrang és új jelvények. Az XP megváltozik, ha törlöd a hozzá kapcsolódó naplózott aktivitást.
- **Adatvédelem:** testsúly és testméretek jelenleg csak helyben tárolódnak, illetve a saját kézzel exportált mentésben. Ne tölts fel személyes mentésfájlt a nyilvános GitHub repóba.
- **Tesztelés:** pull request esetén külön CI ellenőrzi a játéklogikai teszteket és a web buildet.

### Bevezetési ellenőrzőlista
1. Futtasd a `mobile/` mappából: `npm ci && npm test && npm run build:web`.
2. Böngészőn mérés létrehozása, export, import, törlés; majd webapp újratöltése.
3. Súlyzós edzés: két sorozat rögzítése, rekord megjelenítése, edzés törlése.
4. Heti hőspróba teljesítése és XP-egyezőség ellenőrzése a Statisztika fülön.
5. Csak sikeres PR-ellenőrzés után kerüljön a `main` ágba.

## Technológiai és biztonsági frissítés (2026-10)
- Expo SDK 58 / React Native 0.88 / React 19.3, SDK-hoz igazított csomagverziókkal.
- Expo Doctor, játéklogikai tesztek, webes build, mobilméretű Chromium teszt és npm audit a CI-ben.
- Kritikus npm audit figyelmeztetés esetén a CI meghiúsul. Fennmaradó magas/közepes audit és eszközspecifikus ellenőrzések: https://github.com/jtdevzero/Edzi/issues/2
- Natív iOS/Android és Safari kézi teszt szükséges később. A böngészős adatok továbbra is helyiek.

## Edzi ASCENSION – UI és stabilitási megújítás (4 fázis)

1. **ASCENSION design system:** sötét indigó alap, cyan–lila–arany hangsúlyok, prémium tipográfiai hierarchia, új kártyák, főoldal, karakterlap, onboarding és alsó navigáció.
2. **Gyorsabb naplózás és analitika:** edzés gyorsindító, közvetlen sablonok, súlyok gyors állítása, kereshető gyakorlatlista, hangsúlyos rekordok és követhető testmérési trendek.
3. **RPG animációk:** animált karakterkártya, XP-sáv, új quest kijelző, jelvényszoba és nem blokkoló jutalom-overlay.
4. **Offline PWA és biztonság:** verziózott statikus cache, telepítési útmutató, offline állapotjelzés, helyi mentés hibajelzése, browser smoke offline teszt.

**Fontos:** a service worker kizárólag a statikus app-shell elemeket tárolja; személyes egészség-, edzés- és naplóadatokat nem másol a Cache API-ba. A felhasználói adatokat továbbra is az eszköz helyi tárolója tartja. Rendszeresen exportálj mentést.

### Kiadásellenőrzés
`npm ci && npm test && npm run build:web && npx expo-doctor@latest`
CI-ben: 390×844-es mobilméretű Chromium, karakterlétrehozás, mérés és visszaolvasás, súlyzós edzés, offline újratöltés.
Natív iOS/Android és tényleges Safari-készülékteszt továbbra is külön szükséges. A még nyitott magas/közepes függőségi jelzéseket a #2 issue követi.
