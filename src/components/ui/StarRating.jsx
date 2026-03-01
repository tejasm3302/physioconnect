import { useState } from 'react';
import clsx from 'clsx';

export default function StarRating({
  rating = 0,
  maxRating = 5,
  size = 'md',
  editable = false,
  onChange,
  showValue = false,
  className = ''
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (value) => {
    if (editable && onChange) {
      onChange(value);
    }
  };

  return (
    <div className={clsx('flex items-center gap-1', className)}>
      {[...Array(maxRating)].map((_, index) => {
        const value = index + 1;
        const isFilled = value <= (hoverRating || rating);

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => editable && setHoverRating(value)}
            onMouseLeave={() => editable && setHoverRating(0)}
            disabled={!editable}
            className={clsx(
              'transition-colors',
              editable ? 'cursor-pointer' : 'cursor-default',
              isFilled ? 'text-amber-400' : 'text-slate-300 dark:text-zinc-600'
            )}
          >
            <svg
              className={sizes[size]}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-slate-600 dark:text-zinc-400">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
