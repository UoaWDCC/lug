type Props = {
  title: string;
  /** Short mono summary beside the title, e.g. "5 posts". */
  count?: string;
  description: string;
  /** Page-level buttons, aligned to the right on wide screens. */
  actions?: React.ReactNode;
};

/* Heading block shared by the admin list pages. No hooks, so it renders in server and client components. */
export function AdminPageHeader({ title, count, description, actions }: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-6">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            {title}
          </h1>
          {count && (
            <p
              className="font-mono text-lg text-[var(--muted)]"
              aria-live="polite"
            >
              {count}
            </p>
          )}
        </div>
        <p className="mt-2 text-lg text-[var(--muted)]">{description}</p>
      </div>
      {actions}
    </div>
  );
}
