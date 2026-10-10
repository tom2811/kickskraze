import Link from 'next/link';
import { cn } from '@/lib/utils';

const variants = {
  primary:
    'bg-black text-white border-black hover:bg-white hover:text-black',
  secondary:
    'bg-white text-black border-black hover:bg-black hover:text-white',
  ghost:
    'bg-transparent text-black border-transparent hover:border-black hover:bg-black hover:text-white',
} as const;

const sizes = {
  sm: 'px-4 py-2 text-[10px]',
  md: 'px-8 py-3 text-[11px]',
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

const base =
  'inline-flex items-center justify-center font-mono font-semibold uppercase tracking-widest border transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = 'primary',
  size = 'md',
  href,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
}) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
