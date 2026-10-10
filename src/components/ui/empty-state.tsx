import { ButtonLink } from './button';

export function EmptyState({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-24 text-center">
      {eyebrow ? (
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-black/40 mb-4">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-black mb-2">
        {title}
      </h2>
      {description ? <p className="text-sm text-black/50 mb-8">{description}</p> : null}
      {actionHref && actionLabel ? (
        <ButtonLink href={actionHref}>{actionLabel}</ButtonLink>
      ) : null}
    </div>
  );
}

export function PageSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-black/5 w-40" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-24 bg-black/5" />
        ))}
      </div>
    </div>
  );
}
