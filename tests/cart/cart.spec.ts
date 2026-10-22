import products from '../../src/data/products.json';
import { test } from '../../src/fixtures/test';
import { authFile } from '../../src/utils/constants';

const [backpack, bikeLight, boltShirt] = products;

test.describe('Cart', () => {
  test.use({ storageState: authFile('standard') });

  test(
    'shows the products added from the inventory',
    { tag: ['@TC-CART-001', '@smoke', '@regression'] },
    async ({ inventoryPage, cartPage }) => {
      await inventoryPage.visit();
      await inventoryPage.addToCart(backpack.name, bikeLight.name);
      await inventoryPage.header.openCart();

      await cartPage.assertOnPage();
      await cartPage.assertItems([backpack.name, bikeLight.name]);
    },
  );

  test(
    'removes a product from the cart',
    { tag: ['@TC-CART-002', '@regression'] },
    async ({ cartPage }) => {
      await cartPage.visit({ cart: [backpack.id, bikeLight.id, boltShirt.id] });

      await cartPage.removeItem(bikeLight.name);
      await cartPage.assertItems([backpack.name, boltShirt.name]);
      await cartPage.header.assertCartCount(2);
    },
  );

  test(
    'keeps the cart contents after a page reload',
    { tag: ['@TC-CART-003', '@regression'] },
    async ({ page, cartPage }) => {
      await cartPage.visit({ cart: [backpack.id] });

      await page.reload();
      await cartPage.assertItems([backpack.name]);
      await cartPage.header.assertCartCount(1);
    },
  );

  test(
    'returns to the inventory when continuing shopping',
    { tag: ['@TC-CART-004', '@regression'] },
    async ({ cartPage, inventoryPage }) => {
      await cartPage.visit({ cart: [backpack.id] });
      await cartPage.continueShopping();

      await inventoryPage.assertLoaded();
      await inventoryPage.header.assertCartCount(1);
    },
  );

  test(
    'proceeds to checkout',
    { tag: ['@TC-CART-005', '@regression'] },
    async ({ cartPage, checkoutInfoPage }) => {
      await cartPage.visit({ cart: [backpack.id] });
      await cartPage.checkout();

      await checkoutInfoPage.assertOnPage();
    },
  );
});
