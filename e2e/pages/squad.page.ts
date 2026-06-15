import { type Locator, type Page } from '@playwright/test';

/** The home route: the create-career form when empty, the squad view otherwise. */
export class SquadPage {
  readonly careerNameField: Locator;
  readonly createButton: Locator;

  constructor(private readonly page: Page) {
    this.careerNameField = page.getByLabel('Career name');
    this.createButton = page.getByRole('button', { name: 'Create career' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async createCareer(name: string): Promise<void> {
    await this.careerNameField.fill(name);
    await this.createButton.click();
  }

  /** The active career renders as the level-1 heading once one exists. */
  heading(name: string): Locator {
    return this.page.getByRole('heading', { level: 1, name });
  }
}
