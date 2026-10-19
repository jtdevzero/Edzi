// Browser automation uses Chromium at iPhone-sized viewport; it does not replace native Safari tests.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
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
    const response = await page.goto('http://127.0.0.1:4173/Edzi/', { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.getByText('Ébredj fel, harcos').waitFor({ timeout: 15000 });
    console.log('SMOKE: first-use onboarding rendered');
    await page.getByPlaceholder('pl. Jozsi').fill('Teszt Harcos');
    await page.getByText('Egyszerű, kemény, napi edzés. Az erő a kitartásból jön.').click();
    await page.getByText('Kaland indítása').click();
    await page.getByText('Teszt Harcos').waitFor();
    console.log('SMOKE: character created');
    await page.getByText('Statisztika', { exact: true }).last().click();
    await page.getByText('Testösszetétel és mérések', { exact: false }).waitFor();
    await page.getByText('Új mérés rögzítése', { exact: false }).click();
    await page.getByPlaceholder('pl. 85,5').fill('85,5');
    await page.getByText('Mérés mentése').click();
    await page.getByText('85.5 kg').first().waitFor();
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText('Statisztika', { exact: true }).last().click();
    await page.getByText('85.5 kg').first().waitFor();
    console.log('SMOKE: measurement persisted after reload');
    await page.getByText('Naplózás', { exact: true }).last().click();
    await page.getByText('Üres edzés indítása', { exact: false }).click();
    await page.getByText('＋ Gyakorlat', { exact: true }).click();
    await page.getByText('Gyakorlat hozzáadása', { exact: false }).waitFor();
    await page.getByText('Fekvenyomás', { exact: true }).click();
    await page.getByPlaceholder('pl. 60').fill('60');
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
    assert.deepEqual(errors, []);
    console.log('MOBILE-SIZE BROWSER SMOKE SUCCESS');
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err); process.exit(1); });
