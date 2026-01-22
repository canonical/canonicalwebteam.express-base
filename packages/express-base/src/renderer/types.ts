import type { RendererServerEntrypointProps } from "@canonical/react-ssr/renderer";

export interface HTMLTemplateProps<InitialData>
  extends RendererServerEntrypointProps {
  /** All the React elements from the tags inside the <head> element of the page */
  otherHeadElements?: React.ReactElement[];
  scriptElements?: React.ReactElement[];
  linkElements?: React.ReactElement[];
  initialData?: InitialData;
}

export type SSRComponent<InitialData> = React.ComponentType<
  HTMLTemplateProps<InitialData>
>;
export type SSRComponentProps<InitialData> = HTMLTemplateProps<InitialData>;

export type ScriptElement = React.ReactElement<
  React.ComponentProps<"script">,
  "script"
>;
