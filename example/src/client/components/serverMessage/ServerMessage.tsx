import { useEffect, useId, useState } from "react";
import type { ApiResponse } from "../../../shared/types/apiResponseTypes";

function ServerMessage() {
  const dynMessageId = useId();
  const [message, setMessage] = useState("Server message");

  useEffect(() => {
    fetch("/api/test")
      .then((response) => response.json())
      .then((data) => setMessage((data as ApiResponse).message));
  }, []);

  return (
    <div id={dynMessageId}>
      <h3>Server message</h3>
      <p>{message}</p>
    </div>
  );
}

export default ServerMessage;
