import { adminSelectClass } from "./adminStyles";

/* Native <select> with its arrow swapped for our own chevron, which can be spaced off the border
   and follows the text colour in both themes. */
export function AdminSelect(props: React.ComponentProps<"select">) {
  return (
    <span className="relative inline-flex text-[var(--accent-text)]">
      <select {...props} className={adminSelectClass} />
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}
