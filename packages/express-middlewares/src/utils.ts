import React, {
  isValidElement,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from "react";
// import type { PreRenderCallback } from "types";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export function patchReactNode(
  node: ReactNode,
  patchFilter: (element: ReactElement<PropsWithChildren>) => boolean,
  patchMethod: (
    element: ReactElement<PropsWithChildren>,
    children: ReactNode | ReactNode[],
  ) => ReactElement<PropsWithChildren>,
): ReactNode {
  if (!isValidElement(node)) {
    // string, number, null, etc.
    return node;
  }

  // isValidElement means our node is a ReactElement
  const element = node as ReactElement<PropsWithChildren>;
  // Recursively process children if present
  let children: ReactNode | ReactNode[] = [];
  if (element.props.children) {
    children = React.Children.map<ReactNode, ReactNode>(
      element.props.children,
      (child) => patchReactNode(child, patchFilter, patchMethod),
    );
  }

  // patch element if it matches the criteria of the filter
  if (patchFilter(element)) {
    return patchMethod(element, children);
  }

  return React.cloneElement(element, undefined, children);
}

/*
  // Normalize tag name (handles 'script', 'style', and custom components)
  const tag =
    typeof element.type === "string" ? element.type.toLowerCase() : null;

  let newProps: Record<string, unknown> = {};

  // Inject nonce into inline script/style tags only
  if (tag === "script" || tag === "style") {
    newProps.nonce = nonce;
  }
*/
