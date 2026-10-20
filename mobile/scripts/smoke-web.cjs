// Browser automation uses Chromium at iPhone-sized viewport; it does not replace native Safari tests.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: 'hu-HU',
    acceptDownloads: true
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  try {
    fs.mkdirSync('artifacts', { recursive: true });
    const response = await page.goto('http://127.0.0.1:4173/Edzi/', { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.getByText('Ébredj fel, harcos').waitFor({ timeout: 15000 });
    await page.getByText('CHAPTER 01 / IDENTITY').waitFor();
    await page.getByTestId('cinematic-campaign-art').first().waitFor();
    await page.getByText('CHAPTER 02 / THE PATH').waitFor();
    await page.getByText('CHAPTER 03 / THE CONTRACT').waitFor();
    await page.getByText('CLASS 01', {exact:false}).first().waitFor();
    await page.screenshot({path:'artifacts/mythic-onboarding.png',fullPage:true});
    console.log('SMOKE: mythic three-chapter class-art onboarding rendered');
    await page.getByPlaceholder('pl. Jozsi').fill('Teszt Harcos');
    await page.getByText('Egyszerű, kemény, napi edzés. Az erő a kitartásból jön.').click();
    await page.getByText('Kaland indítása').click();
    await page.getByText('Teszt Harcos').waitFor();
    console.log('SMOKE: character created');
    await page.getByText('RANK D').waitFor();
    await page.getByText('COMMON HUNTER').last().waitFor();
    await page.getByText('A küldetésed.', {exact:true}).first().waitFor();
    await page.getByText('FEDEZD FEL A VILÁGOD.').first().waitFor();
    assert.ok(await page.getByTestId('cinematic-campaign-art').count()>0,'Generated hero illustration must be rendered');
    assert.ok(await page.getByTestId('cinematic-world-art').count()>0,'Generated citadel illustration must be rendered');
    assert.ok(await page.getByTestId('cinematic-rank-art').count()>0,'Generated ascension artwork must render');
    await page.getByText('PRIVATE / OFFLINE').first().waitFor();
    console.log('SMOKE: NIGHTFALL hero, expedition teaser and private-mode header');

    await page.getByText('SENSEI / PRIVATE INTELLIGENCE').last().waitFor();
    await page.getByText('Hunter Mode').first().waitFor();
    await page.getByText('Performance', {exact:false}).first().click();
    await page.getByText('PERFORMANCE / LAST 7 DAYS').last().waitFor();
    await page.getByText('Hunter Mode').first().click();
    await page.screenshot({ path: 'artifacts/mythic-dashboard.png', fullPage: true });
    await page.screenshot({ path: 'artifacts/nightfall-dashboard.png', fullPage: true });
    await page.screenshot({ path: 'artifacts/premium-dashboard.png', fullPage: true });
    await page.getByText('Karakter', { exact: true }).last().click();
    await page.getByText('Teszt Harcos', {exact:true}).last().waitFor();
    await page.getByText('Hunter Evolution').first().waitFor();
    await page.getByText('VADÁSZFORMA').first().waitFor();
    await page.getByText('CHARACTER CREATOR / ARMORY').last().waitFor();
    await page.getByText('SISAKFORMA').last().waitFor();
    await page.getByText('Királyi', {exact:true}).last().click();
    await page.getByText('Kezdet', {exact:true}).first().waitFor();
    await page.getByText('Felhőmentés', {exact:true}).last().waitFor();
    await page.getByText('Felhőmentés előkészítve').last().waitFor();
    await page.screenshot({ path: 'artifacts/mythic-character.png', fullPage: true });
    await page.screenshot({ path: 'artifacts/premium-character.png', fullPage: true });
    await page.getByText('Questek', { exact: true }).last().click();
    await page.getByText('MAI KÜLDETÉS TELJESÍTVE').waitFor();
    await page.getByText('Heti boss-aréna', {exact:false}).first().waitFor();
    await page.getByText('Vasőrző').last().waitFor();
    const illustratedBoss=await page.getByText('ENCOUNTER 01', {exact:false}).first().count();
    assert.equal(illustratedBoss,1,'first illustrated encounter should be rendered');
    await page.screenshot({path:'artifacts/mythic-bosses-world.png',fullPage:true});
    await page.getByText('Öt birodalom. Egy történet.').last().waitFor();
    await page.getByText('GUILD HALL / PRIVATE SQUAD').last().waitFor();
    await page.getByText('Céh és taglista szerkesztése', {exact:false}).last().click();
    await page.getByPlaceholder('Céh neve').fill('Teszt Gárda');
    await page.getByText('Céh mentése').last().click();
    await page.getByText('Teszt Gárda').last().waitFor();
    await page.screenshot({ path: 'artifacts/premium-quests.png', fullPage: true });
    await page.getByText('Statisztika', { exact: true }).last().click();
    await page.getByText('Statisztika', { exact: true }).last().click();
    await page.getByText('Testösszetétel és mérések', { exact: false }).waitFor();
    await page.getByText('PERFORMANCE / LAST 7 DAYS').last().waitFor();
    await page.getByText('Közérzet mentése').last().click();
    await page.getByText('Legutóbbi: 3/5', {exact:false}).last().waitFor();
    await page.getByText('Új mérés rögzítése', { exact: false }).click();
    await page.getByPlaceholder('pl. 85,5').fill('85,5');
    await page.getByText('Mérés mentése').click();
    await page.getByText('85.5 kg').first().waitFor();
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText('Statisztika', { exact: true }).last().click();
    await page.getByText('85.5 kg').first().waitFor();
    console.log('SMOKE: measurement persisted after reload');
    await page.getByText('Naplózás', { exact: true }).last().click();
    await page.getByText('Személyes edzésterv').last().waitFor();
    await page.getByText('SMART TRAINING / PROGRESSION').last().waitFor();
    await page.getByText('Szerkesztés').last().click();
    await page.getByPlaceholder('Edzés neve').fill('Egyéni terv');
    await page.getByPlaceholder('Gyakorlatok, vesszővel elválasztva').fill('Fekvenyomás, Evezés rúddal');
    await page.getByText('Edzésnap mentése').last().click();
    await page.getByText('Egyéni terv').last().waitFor();
    await page.getByText('Üres edzés indítása', { exact: false }).click();
    await page.getByText('＋ Gyakorlat', { exact: true }).click();
    await page.getByText('Gyakorlat hozzáadása', { exact: false }).waitFor();
    await page.getByText('Fekvenyomás', { exact: true }).click();
    await page.getByPlaceholder('pl. 60').fill('60');
    await page.getByPlaceholder('RPE 1–10').fill('7');
    await page.getByPlaceholder('RIR 0–10').fill('3');
    await page.getByText('+5', { exact: true }).click();
    await page.getByText('Sorozat kész (5)', { exact: false }).click();
    await page.getByText('Edzés befejezése', { exact: false }).click();
    await page.getByText('Mentés és XP').click();
    await page.getByText('Teszt Harcos').waitFor();
    console.log('SMOKE: weighted workout logged');
    // Offline regression: once SW controls the tab, content and locally stored progress survive.
    await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) throw new Error('Service worker not supported');
      await navigator.serviceWorker.ready;
    });
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15000 });
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByText('Teszt Harcos').first().waitFor({ timeout: 15000 });
    console.log('SMOKE: offline reload preserved character and app shell');
    await context.setOffline(false);
    // Narrow viewport regression: charts and primary navigation may not cause horizontal overflow.
    await page.setViewportSize({width:320,height:700});
    await page.getByText('Statisztika', {exact:true}).last().click();
    await page.getByText('Testösszetétel és mérések', {exact:false}).waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    assert.equal(overflow, false, '320px layout must not overflow horizontally');
    console.log('SMOKE: 320px narrow mobile layout');
    for (const [tab, expected] of [
      ['Főoldal', 'INDULHAT AZ EDZÉS'],
      ['Karakter', 'Teszt Harcos'],
      ['Questek', 'MAI KÜLDETÉS TELJESÍTVE']
    ]) {
      await page.getByText(tab, { exact: true }).last().click();
      await page.getByText(expected, { exact: false }).last().waitFor();
      const tooWide = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
      assert.equal(tooWide, false, tab + ' must fit 320px viewport');
    }
    console.log('SMOKE: premium pages fit 320px');
    // Recovery regression in a separate throwaway browser context; never corrupt the active test profile.
    const badContext=await browser.newContext({viewport:{width:390,height:844}});
    try {
      const bad=await badContext.newPage();
      await bad.goto('http://127.0.0.1:4173/Edzi/',{waitUntil:'networkidle'});
      await bad.evaluate(()=>localStorage.setItem('animefitness:state','{corrupted'));
      await bad.reload({waitUntil:'networkidle'});
      await bad.getByText('A mentésed nem olvasható.').waitFor({timeout:15000});
      console.log('SMOKE: corrupt local state safely displays recovery screen');
    } finally {await badContext.close();}
    assert.deepEqual(errors, []);
    console.log('MOBILE-SIZE BROWSER SMOKE SUCCESS');
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err); process.exit(1); });
