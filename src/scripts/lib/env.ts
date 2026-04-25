import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

let envLoaded = false;
let rootEnvPath: string | undefined;

function getRootEnvPath(): string {
  if (rootEnvPath) {
    return rootEnvPath;
  }

  rootEnvPath = path.resolve(
    fileURLToPath(new URL("../../..", import.meta.url)),
    ".env",
  );
  return rootEnvPath;
}

function loadRootEnvFile(): void {
  if (envLoaded) {
    return;
  }

  envLoaded = true;

  const envFilePath = getRootEnvPath();
  if (!existsSync(envFilePath)) {
    return;
  }

  const loadEnvFile = (
    process as NodeJS.Process & {
      loadEnvFile?: (path?: string) => void;
    }
  ).loadEnvFile;

  if (typeof loadEnvFile === "function") {
    loadEnvFile.call(process, envFilePath);
  }
}

function readEnv(name: string): string | undefined {
  const currentValue = process.env[name]?.trim();
  if (currentValue) {
    return currentValue;
  }

  loadRootEnvFile();

  const loadedValue = process.env[name]?.trim();
  return loadedValue ? loadedValue : undefined;
}

export function requireEnv(name: string): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function optionalEnv(name: string): string | undefined {
  return readEnv(name);
}
