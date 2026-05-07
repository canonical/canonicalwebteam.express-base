import useCSPAttributes from "../hooks/useCspAttributes";

type ScriptProps = React.ScriptHTMLAttributes<HTMLScriptElement>;

export default function Script(props: ScriptProps) {
  const securityProps = useCSPAttributes();
  return <script {...props} {...securityProps} />;
}
