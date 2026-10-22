import usersData from '../../src/data/users.json';
import { expect, test } from '../../src/fixtures/test';
import type { User, Users } from '../../src/types';
import { accessDeniedMessage, authFile, ErrorMessages, Routes } from '../../src/utils/constants';

const users: Users = usersData;

test.describe('Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.visit();
  });

  test(
    'logs in a standard user',
    { tag: ['@TC-AUTH-001', '@smoke', '@regression'] },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.login(users.standard);
      await inventoryPage.assertLoaded();
    },
  );

  test(
    'blocks a locked-out user',
    { tag: ['@TC-AUTH-002', '@regression'] },
    async ({ loginPage }) => {
      await loginPage.login(users.lockedOut);
      await loginPage.assertError(ErrorMessages.lockedOut);
      await loginPage.assertOnPage();
    },
  );

  const invalidLogins: { id: string; scenario: string; credentials: User; error: string }[] = [
    {
      id: '@TC-AUTH-003',
      scenario: 'username is missing',
      credentials: { username: '', password: users.standard.password },
      error: ErrorMessages.usernameRequired,
    },
    {
      id: '@TC-AUTH-004',
      scenario: 'password is missing',
      credentials: { username: users.standard.username, password: '' },
      error: ErrorMessages.passwordRequired,
    },
    {
      id: '@TC-AUTH-005',
      scenario: 'password is wrong',
      credentials: { username: users.standard.username, password: 'wrong_password' },
      error: ErrorMessages.invalidCredentials,
    },
  ];

  for (const { id, scenario, credentials, error } of invalidLogins) {
    test(
      `shows an error when the ${scenario}`,
      { tag: [id, '@regression'] },
      async ({ loginPage }) => {
        await loginPage.login(credentials);
        await loginPage.assertError(error);
      },
    );
  }

  test(
    'dismisses the error message',
    { tag: ['@TC-AUTH-006', '@regression'] },
    async ({ loginPage }) => {
      await loginPage.login({ username: '', password: '' });
      await loginPage.dismissError();
      await loginPage.assertNoError();
    },
  );

  test(
    'redirects unauthenticated users to the login page',
    { tag: ['@TC-AUTH-007', '@regression'] },
    async ({ loginPage, inventoryPage }) => {
      await inventoryPage.visit();
      await loginPage.assertOnPage();
      await loginPage.assertError(accessDeniedMessage(Routes.inventory));
    },
  );

  test.describe('when logged in', () => {
    test.use({ storageState: authFile('standard') });

    test(
      'logs out and clears the session',
      { tag: ['@TC-AUTH-008', '@smoke', '@regression'] },
      async ({ context, loginPage, inventoryPage }) => {
        await inventoryPage.visit();
        await inventoryPage.header.logout();

        await loginPage.assertOnPage();
        const cookieNames = (await context.cookies()).map(({ name }) => name);
        expect(cookieNames).not.toContain('session-username');
      },
    );
  });
});
