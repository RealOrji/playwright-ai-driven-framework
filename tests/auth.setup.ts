import usersData from '../src/data/users.json';
import { test as setup } from '../src/fixtures/test';
import type { Users } from '../src/types';
import { authFile } from '../src/utils/constants';

const users: Users = usersData;

// Logs in through the UI once and saves the session for every spec that needs a logged-in user.
setup('authenticate as the standard user', async ({ page, loginPage, inventoryPage }) => {
  await loginPage.visit();
  await loginPage.login(users.standard);
  await inventoryPage.assertLoaded();

  await page.context().storageState({ path: authFile('standard') });
});
