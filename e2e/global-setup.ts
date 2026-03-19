import { chromium } from "@playwright/test";
import { existsSync } from "fs";

export default async function globalSetup() {
  const executablePath = chromium.executablePath();

  if (!existsSync(executablePath)) {
    throw new Error(
      `\n\n❌ Playwright Chromium browser not found.\n` +
        `   Expected: ${executablePath}\n\n` +
        `   Run the following command to install the browser, then retry:\n\n` +
        `     npx playwright install chromium\n`
    );
  }
}
