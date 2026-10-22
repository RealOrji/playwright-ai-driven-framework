import products from '../../src/data/products.json';
import { expect, test } from '../../src/fixtures/test';
import { authFile, SortOption } from '../../src/utils/constants';

const productNames = products.map(({ name }) => name);
const productPrices = products.map(({ price }) => price);

test.describe('Inventory', () => {
  test.use({ storageState: authFile('standard') });

  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.visit();
    await inventoryPage.assertLoaded();
  });

  test(
    'lists every product with its price',
    { tag: ['@TC-INV-001', '@smoke', '@regression'] },
    async ({ inventoryPage }) => {
      await expect(inventoryPage.items).toHaveCount(products.length);
      expect((await inventoryPage.getProductNames()).sort()).toEqual([...productNames].sort());
      const byValue = (a: number, b: number) => a - b;
      expect((await inventoryPage.getProductPrices()).sort(byValue)).toEqual(
        [...productPrices].sort(byValue),
      );
    },
  );

  test.describe('sorting', () => {
    test(
      'sorts products by name A to Z',
      { tag: ['@TC-INV-002', '@regression'] },
      async ({ inventoryPage }) => {
        await inventoryPage.sortBy(SortOption.NameAsc);
        await expect(inventoryPage.itemNames).toHaveText([...productNames].sort());
      },
    );

    test(
      'sorts products by name Z to A',
      { tag: ['@TC-INV-003', '@regression'] },
      async ({ inventoryPage }) => {
        await inventoryPage.sortBy(SortOption.NameDesc);
        await expect(inventoryPage.itemNames).toHaveText([...productNames].sort().reverse());
      },
    );

    test(
      'sorts products by price low to high',
      { tag: ['@TC-INV-004', '@regression'] },
      async ({ inventoryPage }) => {
        await inventoryPage.sortBy(SortOption.PriceAsc);
        await expect
          .poll(() => inventoryPage.getProductPrices())
          .toEqual([...productPrices].sort((a, b) => a - b));
      },
    );

    test(
      'sorts products by price high to low',
      { tag: ['@TC-INV-005', '@regression'] },
      async ({ inventoryPage }) => {
        await inventoryPage.sortBy(SortOption.PriceDesc);
        await expect
          .poll(() => inventoryPage.getProductPrices())
          .toEqual([...productPrices].sort((a, b) => b - a));
      },
    );
  });

  test(
    'adds and removes products from the cart',
    { tag: ['@TC-INV-006', '@smoke', '@regression'] },
    async ({ inventoryPage }) => {
      const [first, second] = productNames;

      await inventoryPage.addToCart(first, second);
      await inventoryPage.header.assertCartCount(2);
      await inventoryPage.assertProductInCart(first);
      await inventoryPage.assertProductInCart(second);

      await inventoryPage.removeFromCart(first);
      await inventoryPage.header.assertCartCount(1);
      await inventoryPage.assertProductInCart(first, false);
    },
  );

  test(
    'opens the product details page',
    { tag: ['@TC-INV-007', '@regression'] },
    async ({ inventoryPage, productDetailsPage }) => {
      const product = products[0];

      await inventoryPage.openProduct(product.name);
      await productDetailsPage.assertProduct(product);
      await productDetailsPage.addToCart();
      await productDetailsPage.header.assertCartCount(1);

      await productDetailsPage.backToProducts();
      await inventoryPage.assertLoaded();
      await inventoryPage.assertProductInCart(product.name);
    },
  );
});
