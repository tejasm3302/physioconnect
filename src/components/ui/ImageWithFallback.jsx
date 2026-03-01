import { useState } from 'react';
import clsx from 'clsx';
import { IMAGES } from '../../config/images';

export default function ImageWithFallback({
  src,
  alt = 'Image',
  fallback = IMAGES.defaultAvatar,
  className = '',
  ...props
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className={clsx('relative overflow-hidden', className)}>
      {loading && (
        <div className="absolute inset-0 bg-slate-200 dark:bg-zinc-700 animate-pulse" />
      )}
      <img
        src={error ? fallback : src}
        alt={alt}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        className={clsx('w-full h-full object-cover', loading && 'opacity-0')}
        {...props}
      />
    </div>
  );
}
