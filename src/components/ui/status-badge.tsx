import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
  PENDING: 'bg-white text-black',
  PAID: 'bg-black text-white',
  PROCESSING: 'bg-white text-black',
  SHIPPED: 'bg-black text-white',
  DELIVERED: 'bg-black text-white',
  CANCELLED: 'bg-white text-black/40',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border border-black',
        styles[status] ?? 'bg-white text-black'
      )}
    >
      {status}
    </span>
  );
}

export const ORDER_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
