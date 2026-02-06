import { useId } from "react";

function ServerSSRMessage({ message }: { message: string }) {
  const ssrRenderedId = useId();
  const flaskOutputId = useId();
  return (
    <div id={ssrRenderedId}>
      <h3>SSR rendered message</h3>
      <p id={flaskOutputId}>{message}</p>
    </div>
  );
}

export default ServerSSRMessage;
