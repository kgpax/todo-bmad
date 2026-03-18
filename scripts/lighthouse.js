#!/usr/bin/env node
/**
 * Headless Lighthouse audit script.
 *
 * Starts the dev server, runs desktop + mobile audits via the Lighthouse CLI
 * (no visible browser window), prints scores, stops the server, and exits
 * non-zero if any required score is below 100.
 *
 * Usage:
 *   npm run test:lighthouse          # ← always run with required_permissions: ["all"]
 */

const { spawn, execSync } = require("child_process");
const { existsSync, unlinkSync } = require("fs");
const path = require("path");
const os = require("os");

const URL = "http://localhost:3000";
const REQUIRED_SCORE = 100;
const CATEGORIES = ["accessibility", "best-practices", "seo"];
const CHROME_FLAGS = "--headless --no-sandbox --disable-gpu";

const AUDITS = [
  {
    label: "Desktop",
    args: [
      `--form-factor=desktop`,
      `--screen-emulation.mobile=false`,
      `--screen-emulation.width=1350`,
      `--screen-emulation.height=940`,
      `--screen-emulation.deviceScaleFactor=1`,
    ],
  },
  {
    label: "Mobile",
    args: [`--form-factor=mobile`],
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function log(msg) {
  process.stdout.write(msg + "\n");
}

function killDevServer() {
  try {
    execSync("pkill -f 'concurrently' || true", { stdio: "ignore" });
    execSync("pkill -f 'next dev' || true", { stdio: "ignore" });
    execSync("pkill -f 'tsx watch' || true", { stdio: "ignore" });
  } catch {
    // ignore
  }
}

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function attempt() {
      require("http")
        .get(url, (res) => {
          res.resume();
          resolve();
        })
        .on("error", () => {
          if (Date.now() - start > timeoutMs) {
            reject(new Error(`Timed out waiting for ${url}`));
          } else {
            setTimeout(attempt, 500);
          }
        });
    }
    attempt();
  });
}

function runLighthouse(outputPath, extraArgs) {
  return new Promise((resolve, reject) => {
    const args = [
      "lighthouse",
      URL,
      `--chrome-flags=${CHROME_FLAGS}`,
      `--only-categories=${CATEGORIES.join(",")}`,
      "--output=json",
      `--output-path=${outputPath}`,
      "--quiet",
      ...extraArgs,
    ];

    const proc = spawn("npx", args, { stdio: "inherit" });
    proc.on("close", (code) => {
      if (code !== 0) reject(new Error(`Lighthouse exited with code ${code}`));
      else resolve();
    });
  });
}

function readScores(outputPath) {
  const report = JSON.parse(require("fs").readFileSync(outputPath, "utf8"));
  return Object.fromEntries(
    CATEGORIES.map((cat) => [cat, Math.round(report.categories[cat].score * 100)])
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  let devServer;
  let exitCode = 0;

  try {
    log("\n🔧 Starting dev server...");
    devServer = spawn("npm", ["run", "dev"], {
      cwd: path.resolve(__dirname, ".."),
      stdio: "ignore",
      detached: false,
    });

    log("⏳ Waiting for http://localhost:3000...");
    await waitForServer(URL);
    log("✅ Dev server ready\n");

    const results = [];

    for (const audit of AUDITS) {
      const outputPath = path.join(os.tmpdir(), `lh-${audit.label.toLowerCase()}.json`);
      if (existsSync(outputPath)) unlinkSync(outputPath);

      log(`🔍 Running Lighthouse — ${audit.label}...`);
      await runLighthouse(outputPath, audit.args);

      const scores = readScores(outputPath);
      results.push({ label: audit.label, scores });

      const pass = CATEGORIES.every((c) => scores[c] >= REQUIRED_SCORE);
      const icon = pass ? "✅" : "❌";
      log(`${icon} ${audit.label}: Accessibility ${scores.accessibility} | Best Practices ${scores["best-practices"]} | SEO ${scores.seo}`);

      if (!pass) exitCode = 1;
    }

    log("");
    if (exitCode === 0) {
      log("✅ All Lighthouse scores meet the required threshold (100).");
    } else {
      log(`❌ One or more Lighthouse scores are below the required threshold (${REQUIRED_SCORE}).`);
    }
  } catch (err) {
    log(`\n❌ Error: ${err.message}`);
    exitCode = 1;
  } finally {
    log("\n🛑 Stopping dev server...");
    if (devServer) devServer.kill("SIGTERM");
    killDevServer();
    log("✅ Dev server stopped.");
  }

  process.exit(exitCode);
}

main();
