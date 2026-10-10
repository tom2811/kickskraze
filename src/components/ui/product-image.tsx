export function ProductImage({
  src,
  alt,
  className = 'object-contain',
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-[10px] font-mono uppercase tracking-widest text-black/20">
        No image
      </div>
    );
  }

  return (
    // Native img so placehold.co (and other CDNs) render without the image optimizer.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`w-full h-full ${className}`} />
  );
}
