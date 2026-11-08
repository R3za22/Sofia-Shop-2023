import { test, expect, type Page } from '@playwright/test';

const ALMA_URL = '/#/product/alma-sofa';
const CARD_OK = '4242 4242 4242 4242';
const CARD_DECLINE = '4000 0000 0000 0002';

function cartBadge(page: Page) {
  return page.getByTestId('cart-link').locator('span').last();
}

function payButton(page: Page) {
  return page.getByRole('button', { name: /^Pay/ });
}

async function addAlmaToCart(page: Page) {
  await page.goto(ALMA_URL);
  await expect(page.getByRole('heading', { level: 1, name: 'Alma sofa' })).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart', exact: true }).click();
  await expect(page.getByText('Added to cart.')).toBeVisible();
}

async function fillCheckout(page: Page, card: string) {
  await page.getByLabel('Full name').fill('Sara Karimi');
  await page.getByLabel('Mobile number').fill('09121234567');
  await page.getByLabel('Postal code').fill('6135712345');
  await page.getByLabel('Street address').fill('Kianpars, Street 5, No. 12');
  await page.getByLabel('Card number').fill(card);
  await page.getByLabel('Expiry (MM/YY)').fill('12/39');
  await page.getByLabel('CVV2').fill('123');
}

test('browse, filter, sort, paginate', async ({ page }) => {
  await page.goto('/#/products');
  const cards = page.getByTestId('product-grid').locator('a.card');

  await expect(cards).toHaveCount(9);
  await expect(page.getByText('Showing 9 of 24 pieces')).toBeVisible();

  // Pagination
  const pages = page.locator('nav[aria-label="Pages"]');
  await pages.getByRole('button', { name: 'Page 3', exact: true }).click();
  await expect(cards).toHaveCount(6);

  // Back to page 1, then filter
  await pages.getByRole('button', { name: 'Page 1', exact: true }).click();
  await expect(cards).toHaveCount(9);

  const toggle = page.getByRole('button', { name: 'Show filters' });
  if (await toggle.isVisible()) await toggle.click();
  await page.getByRole('checkbox', { name: /^Sofas/ }).check();
  await expect(cards).toHaveCount(3);

  await page.getByRole('checkbox', { name: 'In stock only', exact: true }).check();
  await expect(cards).toHaveCount(2);

  // Sorting
  await page.getByLabel('Sort by').selectOption({ label: 'Price, high to low' });
  await expect(cards.first()).toContainText('Alma sofa');

  // Empty state
  await page.getByPlaceholder('Search products').fill('zzz');
  await expect(page.getByRole('heading', { name: 'Nothing matches those filters' })).toBeVisible();

  // Clear search and every active filter chip, results come back
  await page.getByPlaceholder('Search products').fill('');
  const chips = page.getByRole('button', { name: /^Remove filter/ });
  for (let i = 0; i < 10 && (await chips.count()) > 0; i++) {
    await chips.first().click();
  }
  await expect(page.getByText('Showing 9 of 24 pieces')).toBeVisible();
  await expect(cards).toHaveCount(9);
});

test('browse to cart to checkout to confirmation', async ({ page }) => {
  await addAlmaToCart(page);
  await expect(cartBadge(page)).toHaveText('1');

  await page.getByTestId('cart-link').click();
  await expect(page).toHaveURL(/#\/cart/);
  await expect(page.getByTestId('cart-total')).toHaveText('38,900,000 Toman');

  await page.getByLabel('Discount code').fill('sofia10');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByTestId('cart-total')).toHaveText('35,010,000 Toman');

  await page.getByRole('button', { name: 'Go to checkout' }).click();
  await expect(page).toHaveURL(/#\/checkout/);

  // Empty submit shows validation errors
  await payButton(page).click();
  await expect(page.getByText('Please correct the highlighted fields.')).toBeVisible();
  await expect(page.getByText('This field is required.').first()).toBeVisible();

  await fillCheckout(page, CARD_OK);
  await payButton(page).click();

  await expect(page).toHaveURL(/#\/order\/SF-10230/);
  await expect(page.getByRole('heading', { name: /Thank you, Sara/ })).toBeVisible();
  await expect(page.getByTestId('order-id')).toContainText('SF-10230');

  await page.getByRole('link', { name: 'View my orders' }).click();
  await expect(page).toHaveURL(/#\/account/);
  const rows = page.getByTestId('order-row');
  await expect(rows).toHaveCount(3);
  await expect(rows.first()).toContainText('SF-10230');

  // The new order survives a reload (localStorage persistence)
  await page.reload();
  await expect(page.getByTestId('order-row')).toHaveCount(3);
  await expect(page.getByTestId('order-row').first()).toContainText('SF-10230');
});

test('declined card keeps the cart', async ({ page }) => {
  await addAlmaToCart(page);
  await page.goto('/#/checkout');
  await fillCheckout(page, CARD_DECLINE);
  await payButton(page).click();

  await expect(page.getByText('Payment did not go through')).toBeVisible();
  await expect(page).toHaveURL(/\/checkout/);
  await expect(cartBadge(page)).toHaveText('1');

  await fillCheckout(page, CARD_OK);
  await payButton(page).click();
  await expect(page).toHaveURL(/#\/order\/SF-10230/);
  await expect(page.getByRole('heading', { name: /Thank you, Sara/ })).toBeVisible();
});

test('empty cart, sold-out product, 404, bad discount code', async ({ page }) => {
  await page.goto('/#/cart');
  await expect(page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();

  await page.goto('/#/product/rayan-sofa');
  await expect(page.getByRole('button', { name: 'Sold out', exact: true })).toBeDisabled();

  await page.goto('/#/nope');
  await expect(page.getByRole('heading', { name: 'We could not find that page' })).toBeVisible();

  await addAlmaToCart(page);
  await page.goto('/#/cart');
  await page.getByLabel('Discount code').fill('bogus');
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(page.getByText('That code is not valid.')).toBeVisible();
  await expect(page.getByTestId('cart-total')).toHaveText('38,900,000 Toman');
});

test('error state and retry', async ({ page }) => {
  await page.goto('/?fail=products#/products');
  const alert = page.getByRole('alert').filter({ hasText: 'Something went wrong' });
  await expect(alert).toBeVisible();
  await expect(alert.getByRole('button', { name: 'Try again' })).toBeVisible();
});

test('Persian RTL', async ({ page }) => {
  await page.goto('/?lang=fa#/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');

  await page.getByRole('navigation').getByText('پذیرایی', { exact: true }).first().click();
  await expect(page).toHaveURL(/#\/products/);

  await page.getByRole('button', { name: 'تغییر به انگلیسی', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('no request leaves the origin', async ({ page }) => {
  const baseURL = test.info().project.use.baseURL ?? '';
  const origin = new URL(baseURL).origin;
  const external: string[] = [];

  page.on('request', (req) => {
    const url = req.url();
    if (url.startsWith('data:') || url.startsWith('blob:')) return;
    if (!url.startsWith(origin)) external.push(url);
  });

  await page.goto('/#/products');
  await expect(page.getByTestId('product-grid').locator('a.card')).toHaveCount(9);

  await addAlmaToCart(page);
  await page.goto('/#/checkout');
  await fillCheckout(page, CARD_OK);
  await payButton(page).click();
  await expect(page).toHaveURL(/#\/order\/SF-10230/);

  expect(external).toEqual([]);
});
