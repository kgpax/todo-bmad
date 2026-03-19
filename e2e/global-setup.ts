import { chromium } from "@playwright/test";
import { existsSync } from "fs";

export default async function globalSetup() {
  const executablePath = chromium.executablePath();

  if (!existsSync(executablePath)) {
    throw new Error(
      `\n\n❌ Playwright Chromium browser not found.\n` +
        `   Expected: ${executablePath}\n\n` +
        `   Cursor stores browser binaries in a temp directory that is cleared on\n` +
        `   system restart. Fix by running (with required_permissions: ["all"]):\n\n` +
        `     npx playwright install chromium\n`
    );
  }
}
