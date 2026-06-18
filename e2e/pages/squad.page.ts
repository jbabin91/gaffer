import { type Locator, type Page } from '@playwright/test';

/** The gated squad route: the create-career form when empty, the squad otherwise. */
export class SquadPage {
  readonly careerNameField: Locator;
  readonly createButton: Locator;

  constructor(private readonly page: Page) {
    this.careerNameField = page.getByLabel('Career name');
    this.createButton = page.getByRole('button', { name: 'Create career' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/squad');
  }

  async createCareer(name: string): Promise<void> {
    await this.careerNameField.fill(name);
    await this.createButton.click();
  }

  heading(name: string): Locator {
    return this.page.getByRole('heading', { level: 1, name });
  }
}
