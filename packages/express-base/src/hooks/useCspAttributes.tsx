import {
  GENERATE_HASH_ATTR,
  IntegrityContext,
  NonceContext,
} from "@canonical/express-middlewares";
import { useContext } from "react";

export default function useCSPAttributes() {
  const nonce: string | undefined = useContext(NonceContext);
  const isHashable: boolean = useContext(IntegrityContext);

  if (nonce) {
    return { nonce };
  }

  if (isHashable) {
    return { [GENERATE_HASH_ATTR]: "true" };
  }

  return {};
}
