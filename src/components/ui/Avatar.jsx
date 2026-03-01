import clsx from 'clsx';
import { IMAGES } from '../../config/images';

const sizes = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-24 h-24',
  '3xl': 'w-32 h-32'
};

const badgeSizes = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-6 h-6',
  '2xl': 'w-7 h-7',
  '3xl': 'w-8 h-8'
};

export default function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  verified = false,
  ring = false,
  className = ''
}) {
  const handleError = (e) => {
    e.target.src = IMAGES.defaultAvatar;
  };

  return (
    <div className={clsx('relative inline-block flex-shrink-0', className)}>
      <img
        src={src || IMAGES.defaultAvatar}
        alt={alt}
        onError={handleError}
        className={clsx(
          'rounded-full object-cover',
          sizes[size],
          ring && 'ring-2 ring-primary-100 dark:ring-zinc-700'
        )}
      />
      {verified && (
        <div
          className={clsx(
            'absolute -bottom-1 -right-1 bg-lime-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center',
            badgeSizes[size]
          )}
        >
          <svg className="w-3/5 h-3/5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}
