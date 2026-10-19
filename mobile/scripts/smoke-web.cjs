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
    await page.getByRole('tab', { name: /Statisztika/ }).click();
    await page.getByText('Testösszetétel és mérések', { exact: false }).waitFor();
    await page.getByText('Új mérés rögzítése', { exact: false }).click();
    await page.getByPlaceholder('pl. 85,5').fill('85,5');
    await page.getByText('Mérés mentése').click();
    await page.getByText('85.5 kg').first().waitFor();
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('tab', { name: /Statisztika/ }).click();
    await page.getByText('85.5 kg').first().waitFor();
    console.log('SMOKE: measurement persisted after reload');
    await page.getByRole('tab', { name: /Naplózás/ }).click();
    await page.getByText('Üres edzés indítása', { exact: false }).click();
    await page.getByText('Gyakorlat hozzáadása', { exact: false }).waitFor();
    await page.getByText('Fekvenyomás', { exact: true }).click();
    await page.getByPlaceholder('pl. 60').fill('60');
    await page.getByText('+5', { exact: true }).click();
    await page.getByText('Sorozat kész (5)', { exact: false }).click();
    await page.getByText('Edzés befejezése', { exact: false }).click();
    await page.getByText('Mentés és XP').click();
    await page.getByText('Teszt Harcos').waitFor();
    console.log('SMOKE: weighted workout logged');
    assert.deepEqual(errors, []);
    console.log('MOBILE-SIZE BROWSER SMOKE SUCCESS');
  } finally {
    await browser.close();
  }
})().catch(err => { console.error(err); process.exit(1); });
