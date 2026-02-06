import "./Spinner.css";

export default function Spinner() {
  return (
    <div
      className={["spinner", "spinner--active"].join(" ")}
      role="progressbar"
      aria-busy="true"
    />
  );
}
