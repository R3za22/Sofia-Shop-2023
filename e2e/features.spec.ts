import { expect, test } from '@playwright/test';

test('wishlist: heart on card and PDP, wishlist page, persistence', async ({ page }) => {
  await page.goto('/#/products?q=kaveh');
  await page.getByRole('button', { name: 'Add Kaveh vase to wishlist' }).click();
  await expect(page.getByRole('button', { name: 'Remove Kaveh vase from wishlist' })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/#/product/tir-lamp');
  await page.getByRole('button', { name: 'Add Tir floor lamp to wishlist' }).click();
  await page.goto('/#/wishlist');
  await expect(page.getByTestId('wishlist-grid').locator('.card')).toHaveCount(2);
  await page.reload();
  await expect(page.getByTestId('wishlist-grid').locator('.card')).toHaveCount(2);
  await page.getByRole('button', { name: 'Remove Kaveh vase from wishlist' }).click();
  await expect(page.getByTestId('wishlist-grid').locator('.card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Remove Tir floor lamp from wishlist' }).click();
  await expect(page.getByRole('heading', { name: 'Your wishlist is empty' })).toBeVisible();
});

test('sign-in and sign-out gate the account page', async ({ page }) => {
  await page.goto('/#/account');
  await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible();
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByText('You have been signed out.')).toBeVisible();
  await page.goto('/#/account');
  await expect(page.getByText('Sign in to see this page.')).toBeVisible();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('This field is required.').first()).toBeVisible();
  await page.getByLabel('Email').fill('bad');
  await page.getByLabel('Password').fill('123');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await expect(page.getByText('Use at least 6 characters.')).toBeVisible();
  await page.getByLabel('Email').fill('me@example.com');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('That email and password do not match.')).toBeVisible();
  await page.getByLabel('Password').fill('secret1');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByTestId('order-row')).toHaveCount(2);
});

test('sofa sizes are priced per size through to the cart', async ({ page }) => {
  await page.goto('/#/product/alma-sofa');
  await expect(page.getByTestId('pdp-price')).toHaveText('38,900,000 Toman');
  await page.getByRole('button', { name: /^2-seat/ }).click();
  await expect(page.getByTestId('pdp-price')).toHaveText('30,000,000 Toman');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.getByRole('button', { name: /^4-seat/ }).click();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await page.goto('/#/cart');
  await expect(page.getByTestId('cart-line')).toHaveCount(2);
  await expect(page.getByTestId('cart-total')).toHaveText('79,000,000 Toman');
});

test('price range slider filters the list', async ({ page }) => {
  await page.goto('/#/products');
  await expect(page.getByText('Showing 9 of 24 pieces')).toBeVisible();
  const toggle = page.getByRole('button', { name: 'Show filters' });
  if (await toggle.isVisible()) await toggle.click();
  await page.getByTestId('price-min').fill('10000000');
  await expect(page.getByText(/Showing \d+ of (\d+) pieces/)).not.toHaveText(/of 24 pieces/);
  await page.getByTestId('price-max').fill('20000000');
  await expect(page.getByRole('button', { name: /Remove filter 10,000,000 . 20,000,000/ })).toBeVisible();
  await page.getByLabel('Sort by').selectOption('price-asc');
  const first = page.locator('.card__price').first();
  await expect(first).toContainText('Toman');
  const prices = await page.locator('.card__price').allInnerTexts();
  for (const p of prices) {
    const n = Number(p.replace(/[^\d]/g, ''));
    expect(n).toBeGreaterThanOrEqual(10_000_000);
    expect(n).toBeLessThanOrEqual(20_000_000);
  }
});

test('info pages and the validated contact form', async ({ page }) => {
  await page.goto('/#/product/alma-sofa');
  await page.getByRole('link', { name: 'Delivery', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Delivery', level: 1 })).toBeVisible();
  for (const [slug, h] of [['returns', 'Returns'], ['care', 'Care guide']]) {
    await page.goto(`/#/info/${slug}`);
    await expect(page.getByRole('heading', { name: h, level: 1 })).toBeVisible();
  }
  await page.goto('/#/info/bogus');
  await expect(page.getByRole('heading', { name: 'We could not find that page' })).toBeVisible();
  await page.goto('/#/contact');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('This field is required.').first()).toBeVisible();
  await page.getByLabel('Your name').fill('Sara Karimi');
  await page.getByLabel('Email or mobile number').fill('nope');
  await page.getByLabel('Message').fill('short');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText(/Enter an email address or a mobile number/)).toBeVisible();
  await expect(page.getByText('Please write at least 10 characters.')).toBeVisible();
  await page.getByLabel('Email or mobile number').fill('sara@example.com');
  await page.getByLabel('Message').fill('Do you deliver to Shiraz?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('heading', { name: 'Message sent' })).toBeVisible();
  await expect(page.getByText(/MSG-1001/)).toBeVisible();
});

test('Persian UI shows the demo account name in Persian', async ({ page }) => {
  await page.goto('/?lang=fa#/account');
  await expect(page.getByText(/سارا کریمی/).first()).toBeVisible();
  await expect(page.getByText('Sara Karimi')).toHaveCount(0);
});
