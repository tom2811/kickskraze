export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white border border-black p-8 w-full max-w-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-start justify-between gap-4 mb-8 border-b border-black/15 pb-4">
          <h2 id="modal-title" className="font-display text-2xl font-bold uppercase tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] font-mono uppercase tracking-widest text-black/40 hover:text-black"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
