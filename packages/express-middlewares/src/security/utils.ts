import crypto from "node:crypto";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const calculateHash = (content: string): string =>
  crypto.createHash("sha256").update(content).digest("base64");

export const generateNonce = (): string =>
  crypto.randomBytes(32).toString("hex");
