import customer from '../../src/data/customer.json';
import products from '../../src/data/products.json';
import { expect, test } from '../../src/fixtures/test';
import type { Customer } from '../../src/types';
import { authFile, ErrorMessages, TAX_RATE } from '../../src/utils/constants';
import { roundCurrency, sum } from '../../src/utils/helpers';

const [backpack, bikeLight, fleeceJacket] = [products[0], products[1], products[3]];

test.describe('Checkout', () => {
  test.use({ storageState: authFile('standard') });

  test(
    'completes a purchase end to end',
    { tag: ['@TC-CHK-001', '@smoke', '@regression'] },
    async ({
      inventoryPage,
      cartPage,
      checkoutInfoPage,
      checkoutOverviewPage,
      checkoutCompletePage,
    }) => {
      await inventoryPage.visit();
      await inventoryPage.addToCart(backpack.name, bikeLight.name);
      await inventoryPage.header.openCart();
      await cartPage.assertItems([backpack.name, bikeLight.name]);
      await cartPage.checkout();

      await checkoutInfoPage.fillCustomerInfo(customer);
      await checkoutInfoPage.continue();
      await checkoutOverviewPage.assertOnPage();
      await checkoutOverviewPage.finish();

      await checkoutCompletePage.assertOrderConfirmed();
      await checkoutCompletePage.header.assertCartCount(0);
      await checkoutCompletePage.backHome();
      await inventoryPage.assertLoaded();
    },
  );

  test(
    'calculates the subtotal, tax and total',
    { tag: ['@TC-CHK-002', '@regression'] },
    async ({ checkoutInfoPage, checkoutOverviewPage }) => {
      const cart = [backpack, bikeLight, fleeceJacket];
      const expectedSubtotal = sum(cart.map(({ price }) => price));
      const expectedTax = roundCurrency(expectedSubtotal * TAX_RATE);

      await checkoutInfoPage.visit({ cart: cart.map(({ id }) => id) });
      await checkoutInfoPage.fillCustomerInfo(customer);
      await checkoutInfoPage.continue();

      const { itemPrices, subtotal, tax, total } = await checkoutOverviewPage.getOrderSummary();
      expect(sum(itemPrices), 'items add up to subtotal').toBe(subtotal);
      expect(subtotal, 'subtotal').toBe(expectedSubtotal);
      expect(tax, 'tax').toBe(expectedTax);
      expect(total, 'total').toBe(roundCurrency(expectedSubtotal + expectedTax));
    },
  );

  const missingFields: { id: string; field: keyof Customer; error: string }[] = [
    { id: '@TC-CHK-003', field: 'firstName', error: ErrorMessages.firstNameRequired },
    { id: '@TC-CHK-004', field: 'lastName', error: ErrorMessages.lastNameRequired },
    { id: '@TC-CHK-005', field: 'postalCode', error: ErrorMessages.postalCodeRequired },
  ];

  for (const { id, field, error } of missingFields) {
    test(
      `requires the ${field} field`,
      { tag: [id, '@regression'] },
      async ({ checkoutInfoPage }) => {
        await checkoutInfoPage.visit({ cart: [backpack.id] });

        await checkoutInfoPage.fillCustomerInfo({ ...customer, [field]: '' });
        await checkoutInfoPage.continue();
        await checkoutInfoPage.assertError(error);
        await checkoutInfoPage.assertOnPage();
      },
    );
  }

  test(
    'returns to the cart when checkout is cancelled',
    { tag: ['@TC-CHK-006', '@regression'] },
    async ({ checkoutInfoPage, cartPage }) => {
      await checkoutInfoPage.visit({ cart: [backpack.id] });
      await checkoutInfoPage.cancel();

      await cartPage.assertOnPage();
      await cartPage.assertItems([backpack.name]);
    },
  );
});
