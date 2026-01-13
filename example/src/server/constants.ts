import fs from "node:fs/promises";
import path from "node:path";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
export const PORT = process.env.PORT || 3010;
export const BASE = process.env.BASE || "/";

export const TEMPLATE_HTML = await fs.readFile(
  path.join(process.cwd(), "dist", "client", "index.html"),
  "utf-8"
);
