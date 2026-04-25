import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { optionalEnv, requireEnv } from "./env.ts";

type ServiceAccountConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function normalizePrivateKey(privateKey: string): string {
  return privateKey.replace(/\\n/g, "\n").trim();
}

function readServiceAccountFromJsonEnv(): ServiceAccountConfig | undefined {
  const rawJson = optionalEnv("FIREBASE_SERVICE_ACCOUNT_JSON");
  const base64Json = optionalEnv("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64");
  const jsonPayload = rawJson || (base64Json
    ? Buffer.from(base64Json, "base64").toString("utf8")
    : undefined);

  if (!jsonPayload) {
    return undefined;
  }

  const parsed = JSON.parse(jsonPayload) as {
    project_id?: string;
    client_email?: string;
    private_key?: string;
  };

  if (!parsed.project_id || !parsed.client_email || !parsed.private_key) {
    throw new Error(
      "Firebase service account JSON is missing project_id, client_email, or private_key.",
    );
  }

  return {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: normalizePrivateKey(parsed.private_key),
  };
}

function readServiceAccountFromLegacyEnv(): ServiceAccountConfig {
  return {
    projectId: requireEnv("FIREBASE_PROJECT_ID"),
    clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
    privateKey: normalizePrivateKey(requireEnv("FIREBASE_PRIVATE_KEY")),
  };
}

export function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccount =
    readServiceAccountFromJsonEnv() || readServiceAccountFromLegacyEnv();

  return initializeApp({
    credential: cert({
      projectId: serviceAccount.projectId,
      clientEmail: serviceAccount.clientEmail,
      privateKey: serviceAccount.privateKey,
    }),
    storageBucket: optionalEnv("FIREBASE_STORAGE_BUCKET"),
  });
}

export function getDb() {
  return getFirestore(getFirebaseApp());
}

export function getBucket() {
  return getStorage(getFirebaseApp()).bucket();
}
