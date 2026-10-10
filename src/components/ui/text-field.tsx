import { cn } from '@/lib/utils';

const fieldClass =
  'w-full px-3 py-2.5 bg-white text-black text-sm font-mono border border-black/20 placeholder-black/30 focus:outline-none focus:border-black transition-colors appearance-none';

export function TextField({
  label,
  id,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const fieldId = id ?? props.name;
  return (
    <div>
      <label
        htmlFor={fieldId}
        className="block text-[10px] font-mono uppercase tracking-widest font-bold text-black/40 mb-2"
      >
        {label}
      </label>
      <input id={fieldId} className={cn(fieldClass, className)} {...props} />
    </div>
  );
}

export function SelectField({
  label,
  id,
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  children: React.ReactNode;
}) {
  const fieldId = id ?? props.name;
  return (
    <div>
      {label ? (
        <label
          htmlFor={fieldId}
          className="block text-[10px] font-mono uppercase tracking-widest font-bold text-black/40 mb-2"
        >
          {label}
        </label>
      ) : null}
      <select id={fieldId} className={cn(fieldClass, 'cursor-pointer', className)} {...props}>
        {children}
      </select>
    </div>
  );
}
