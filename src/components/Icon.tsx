type IconName =
  | "chat"
  | "book"
  | "spark"
  | "send"
  | "copy"
  | "plus"
  | "menu"
  | "close"
  | "sun"
  | "moon";

const paths: Record<IconName, string> = {
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5",
  moon: "M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z",
  chat: "M21 11a8 8 0 0 1-8 8H8l-5 3V11a9 9 0 0 1 18 0Z",
  book: "M12 5v16m0-16C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z",
  spark: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
  send: "M12 19V5m-6 6 6-6 6 6",
  copy: "M9 9h12v12H9V9ZM15 5V3H3v12h2",
  plus: "M12 5v14M5 12h14",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
};

export default function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
