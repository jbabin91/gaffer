import { type Page } from '@playwright/test';

type Credentials = { email: string; name: string; password: string };

export class AuthPage {
  constructor(private readonly page: Page) {}

  // Forms native-submit before hydration, clearing any filled values, so wait
  // for [data-hydrated]. Assert the URL too: a silent redirect would satisfy
  // the hydration wait and surface only as a missing-field timeout later.
  private async ready(path: string): Promise<void> {
    const pathname = new URL(path, 'http://e2e').pathname;
    await this.page.goto(path);
    await this.page.waitForURL((url) => url.pathname === pathname);
    await this.page.locator('html[data-hydrated]').waitFor();
  }

  async signUp({ email, name, password }: Credentials): Promise<void> {
    await this.ready('/sign-up');
    await this.page.getByLabel('Name').fill(name);
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: 'Create account' }).click();
  }

  async login(email: string, password: string): Promise<void> {
    await this.ready('/login');
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async requestReset(email: string): Promise<void> {
    await this.ready('/forgot-password');
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByRole('button', { name: 'Send reset link' }).click();
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.ready(`/reset-password?token=${encodeURIComponent(token)}`);
    await this.page.getByLabel('New password').fill(newPassword);
    await this.page.getByRole('button', { name: 'Update password' }).click();
  }
}
