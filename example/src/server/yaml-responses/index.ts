import { yamlDeleted, yamlRedirects } from "@canonical/yaml-responses";
import { IS_PRODUCTION } from "../constants";

// TODO: what follows is a disgusting workaround, we shouldn't do this, instead we should use
// something that lets us inline the yaml files in dev mode automatically like vite does in when
// building the app
let redirectsYaml = "";
let permanentRedirectsYaml = "";
let deletedYaml = "";

if (IS_PRODUCTION) {
  ({ redirectsYaml, permanentRedirectsYaml, deletedYaml } = await import(
    "./prod-yaml"
  ));
} else {
  ({ redirectsYaml, permanentRedirectsYaml, deletedYaml } = await import(
    "./dev-yaml"
  ));
}

export const redirects = yamlRedirects(redirectsYaml);
export const permanentRedirects = yamlRedirects(permanentRedirectsYaml, true);
export const deleted = yamlDeleted(deletedYaml);

export default [redirects, permanentRedirects, deleted];
