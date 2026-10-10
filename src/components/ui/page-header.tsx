export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/40 mb-2">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-[0.95] uppercase">
          {title}
        </h1>
      </div>
      {children}
    </header>
  );
}
