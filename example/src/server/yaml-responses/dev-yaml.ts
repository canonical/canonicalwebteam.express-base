import { readFile } from "node:fs/promises";
import { join } from "node:path";

let redirectsYaml = "";
let permanentRedirectsYaml = "";
let deletedYaml = "";

try {
  redirectsYaml = (
    await readFile(join(import.meta.dirname, "redirects.yaml"))
  ).toString();
  permanentRedirectsYaml = (
    await readFile(join(import.meta.dirname, "permanent-redirects.yaml"))
  ).toString();
  deletedYaml = (
    await readFile(join(import.meta.dirname, "deleted.yaml"))
  ).toString();
} catch (error) {
  console.error("Couldn't find .yaml redirect file:", error);
}

export { redirectsYaml, permanentRedirectsYaml, deletedYaml };
