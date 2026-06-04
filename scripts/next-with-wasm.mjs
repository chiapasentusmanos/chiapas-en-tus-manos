import { spawn } from "node:child_process";
import { join, resolve } from "node:path";

const command = process.argv[2] || "dev";
const args = process.argv.slice(3);
const env = {
  ...process.env,
  NEXT_TEST_WASM_DIR: join(resolve(process.cwd()), "node_modules", "@next", "swc-wasm-nodejs")
};

const child = spawn("next", [command, ...args], {
  env,
  stdio: "inherit",
  shell: process.platform === "win32"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
