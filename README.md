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


## Edzi 3.0 – EVOLUTION (2026. október)

A korábbi helyi, offline adatbázis v2→v3 migrációval bővül. Megmaradnak a meglévő naplók, testmérések, XP és karakterek.

**Hunter Evolution:** 5 szintalapú karakterforma, bossgyőzelmekkel nyitható aurák; csak vizuális jutalmak, személyre szabható karakterlapon.

**Fitness Pro 2.0:** szerkeszthető heti edzésterv, RPE (1–10), RIR (0–10), bemelegítő sorozatok, volumen és becsült 1RM legfeljebb 12 ismétlésből. A súlyjavaslat visszafogott; nem helyettesíti a megfelelő technikát, bemelegítést és pihenést.

**Bossok:** minden héten három objektív kihívás: két edzésnap, 90 edzésperc, 15 naplózott erősítő sorozat. Jutalmak a valódi naplókból számolódnak, törlésre visszavonhatók. A korábban rögzített aktivitások után is járhat visszamenőleges XP.

**Performance Intelligence:** előző és aktuális héthez viszonyított terhelés, gyakorlatvolumen, időkövetés, szubjektív 1–5 regenerációs check-in. Két megjelenítési mód: Hunter és Performance.

**Cloud Vault (opcionális):** kézi felhőfeltöltés és visszaállítás Supabase email OTP + RLS alapján. *Alapértelmezetten nincs konfigurálva és nincs automatikus szinkron.* A működéshez külső Supabase projekt, a `supabase/edzi_snapshots.sql` RLS szabályainak telepítése és éles hozzáférési/kockázati tesztelés kell. A Supabase szolgáltató látja a tárolt adatokat, nincs végpontok közötti titkosítás; ne használj service-role kulcsot a kliensben. A titkos adatokat soha ne tedd fel a nyilvános repóba.

**Mentésvédelem:** a sérült helyi adattároló automatikus üres felülírása blokkolt; mentés visszaállítása vagy kifejezetten megerősített újrakezdés választható.

### Nem lezárt munkák
- Supabase Cloud Vault éles integrációs teszt tényleges, felhasználónként elkülönített fiókokkal; élő fiókot csak adatvédelmi ellenőrzés után kapcsolj be.
- Fizikai iPhone/Safari és Android, valamint EAS natív buildek ellenőrzése.
- Korábban azonosított npm audit figyelmeztetések részletes triage (#2).

CI: `cd mobile && npm ci && npm test && npm run build:web && npx expo-doctor@latest` + Chromium mobil smoke, offline reload és 320px viewport.

## Edzi 4.0 — Hunter World (2026-10)
- Öt fejezetes, interaktív **helyben működő** Hunter World világtérkép, automatikusan feloldható régiók és páncélok. A világtérkép a régi edzésnaplókból is kiszámolható; nincs duplán járó XP.
- Karakteralkotó: sisakformák, sisakfény, feloldható páncélszínek — offline vektoros megjelenés.
- Smart Training: előző sorozatok és friss közérzet alapján magyarázható terhelési támpontok, heti szuperszett párosítások. A szuperszett csak tervben létezik, nem rögzít automatikusan edzést.
- Mentor: magyarázható, offline **szabályalapú** edző. Nem generatív AI, nem küld személyes adatot külső API-nak. Valódi felhőalapú AI coachhoz szerveroldali modellhívás és önkéntes adattovábbítás kell.
- Guild Hall: **helyi céh-tervező** a megadott nevekkel és a saját naplód alapján számolt célokkal. Valódi online multiplayer, valós idejű baráti adatok és szinkron nincs bekapcsolva; ehhez hitelesített szerver és részletes hozzáférési teszt szükséges.
- Helyi séma: v4; v3 edzések/karakterek/questek megmaradnak. JSON-export/import tartalmazza a céhet és a szuperszett-terveket.
- A megmaradt npm audit figyelmeztetések (#2), a Supabase Vault integráció (#7), valódi Safari/Android készülékpróba változatlanul külön kiadási teendők.

### Ellenőrzés
A PR automatikus CI-je futtatja a logikai teszteket, Expo Doctort, web exportot, telefonméretű Playwright tesztet, offline újratöltést és keskeny nézetet. A GitHub Pages csak zöld teszt után frissülhet.

### Edzi 4.0 — opcionális Online AI Sensei
- A Hunter Mentor **alapértelmezett része offline**, nem generatív és nem továbbít adatot.
- A generatív AI csak saját Supabase Edge Function + szerveroldali Anthropic-kulcs telepítése után jelenik meg.
- A felhasználó **külön, minden kéréskor** jóváhagyja az anonimizált aggregált edzésszám, perc, szint, streak és közérzet továbbítását; név, testméret, edzéssúly, szabad szöveges napló nem megy át.
- Auth JWT validáció és szerveroldali napi 5 kérés limit szükséges: `supabase/edzi_ai_usage.sql`, `supabase/functions/hunter-coach/index.ts`.
- A szolgáltatást élő auth-, adatvédelmi és abuse-teszt hiányában nem szabad automatikusan aktiválni.

### Hunter World – online közösség (külön konfigurációhoz kötve)
Az Edzi 4.0 tartalmaz opcionális, Supabase RLS-sel védett valódi céhes bejelentkezést, meghívókódos csatlakozást és kézzel megosztható heti összesítőket. A szolgáltatás **csak Supabase-projekt konfigurálásával**, a `supabase/edzi_guilds.sql` telepítésével és két fiókos jogosultságteszttel válik használhatóvá. A helyi Guild Hall offline is működik. Nincs alapértelmezett automatikus közösségi adatmegosztás.

## Edzi NIGHTFALL — arculati újratervezés (2026-10-20)
- Az Edzi 4.0 funkciói **változatlanul** megmaradtak; ez külön **teljes UI-irányváltás**, nem adatmodellcsere.
- Új obsidian/signal-amber/aurora-mint grafikai rendszer (`mobile/src/theme.js`), kontrasztos tipográfia és HUD-szerű felületek.
- Új felhasználói főoldal: nagy, több rétegű SVG-gyűrűs **Hunter Dossier** karakterpanel, XP, világfelfedező teaser és jól kiemelt edzés CTA.
- Lebegő ötféles alsó menü középen kiemelt naplózás gombbal; hálózati státusz helyett **PRIVATE / OFFLINE** jelzés.
- Edzésmód, questek, karakteralkotó, statisztika és beléptetés összehangolt Nightfall stílusban.
- Nincs külső képbetöltés vagy licencfüggő vizuális elem; az illusztrációk helyben renderelt vektorok.
- Frissített PWA-cache név; a régi tartalom helyett új buildre kényszerítő service worker aktiválás.
- Vizuális ellenőrzés: GitHub CI Chromium 390px + 320px képernyőméretek, screenshot artefakt `nightfall-dashboard.png`. A fizikai iOS Safari teszt külön szükséges.

## EDZI MYTHIC — prémium vizuális csomag

A NIGHTFALL felület teljes illusztrált art-pass kiadása, v4 adatmodell változtatása nélkül:
- A teljesen saját, offline `MythicIcon` SVG emblémarendszer kiváltja a platformonként eltérő emojikat az onboardingban, főoldalon, statisztikákban, karakterlapon, fitnesznaplóban, guild/küldetés felületeken, rangokon és a jutalom-overlayben.
- Öt egyedi, illusztrált karakterosztály-kártya, három fejezetre bontott, cinematic, de gyorsan használható onboarding. A kezdő karakteradatok és osztályazonosítók változatlanok.
- Három saját vektoros boss-sziluett, fenyegetéskártya, feloldás előrehaladása; öt különböző világrégió eredeti környezetillusztrációval.
- Rangfüggő D→S páncél-, fény-, aura- és háttérevolúció a központi `HunterPortrait` komponensben; a rendszer kizárólag a meglévő szintet használja.
- Common / Rare / Epic / Legendary / Mythic ritkasági paletta és ritkasági jelvények. Az effektusok nem módosítják az XP-t, a játéklogikát vagy az adatbázist.
- Jutalomkártya emblematikus XP-visszajelzéssel, fejlesztett fejléc és újjáhangolt navigáció; a mozgáscsökkentési operációsrendszer-beállítást az XP-sáv figyelembe veszi.
- Új `nightfall-sigil.svg` logó és PWA-manifeszt, HTML témaszín és v6 offline cache.
- CI-képernyőképek: mythic-onboarding, mythic-dashboard, mythic-character, mythic-bosses-world a GitHub Actions artifactban, valamint Chromium 390px/320px funkcionális, offline és recovery smoke tesztek.

**Korlátok:** Az iOS régebbi ikon gyorsítótárazása miatt a kezdőképernyőhöz adott ikon frissítése az alkalmazás újratelepítését igényelheti; az alkalmazás **helyi adatait ne töröld mentés nélkül**. Fizikai Safari/iOS, Android és natív EAS build vizsgálata külön szükséges. A Cloud Vault/AI/Guild szerveres funkciói továbbra is inaktívak, és az ismert függőségi figyelmeztetések is külön feladatot képeznek.

## EDZI CINEMATIC – tényleges képintegráció (2026-10-20)
- AI-val generált kampánygrafikából előkészített, lokálisan csomagolt, optimalizált **eredeti képrészlet**: `mobile/assets/art/hero-scene.jpg`, a főoldali és onboarding környezet rétegeként megjelenítve.
- Saját React Native SVG `CinematicArt` kompozíció, hunter-sziluett és dinamikus rétegek, 8 képernyőterületre bekötve (CharacterCard, WorldTeaser, ClassArtwork, Onboarding, EncounterArt, HunterWorldMap, HunterCreator, RewardOverlay).
- Nem függ a hálózattól: a kép lokális build asset. A karakter, XP, helyi mentés és régiók számítása változatlan.
- Weben Chromium smoke ellenőrzi az eredeti kép tényleges betöltését az onboardingban és főoldalon. PWA service worker cache új neve `edzi-cinematic-v7`, eltávolítja a régebbi edzi cache-verziókat.
- Marketing plakát nem képernyőgrafika; nem hamisított UI-szöveget használunk navigációként, hanem valós komponensek mögötti képrészletet.

- Második, különálló AI-generált grafika: `mobile/assets/art/world-citadel.jpg`, amely ténylegesen megjelenik a Hunter World főoldali és térképes jeleneteiben. A böngészős füstteszt külön ellenőrzi mindkét lokális képes elemet.

## Nightfall cinematic polish v8
- A generált képek erősebb, kevésbé elmosott és még mindig olvasható megjelenítést kaptak az eredeti karakter-, rang- és citadella-illusztrációkból.
- A Quest Board, Performance és Training hero panelek is saját jelenetet és kontrollált fény-/kontrasztréteget kaptak. A napi küldetések paneljén valódi, adatból számolt progress bar látszik.
- A jelenetek ugyanazokat a korábbi lokális asseteket használják, nincs új hálózati igény vagy adatmodell-változás.
- CI/browser smoke 390 és 320px, új hero-komponensek automatikus ellenőrzése. PWA cache v8 a frissített megjelenéshez.
