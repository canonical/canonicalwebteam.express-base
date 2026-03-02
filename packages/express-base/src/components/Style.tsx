import useCspAttributes from "../hooks/useCspAttributes";

type StyleProps = React.StyleHTMLAttributes<HTMLStyleElement>;

export default function Style(props: StyleProps) {
  const securityProps = useCspAttributes();
  return <style {...props} {...securityProps} />;
}
