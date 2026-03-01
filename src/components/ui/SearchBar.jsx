import { useState } from 'react';
import clsx from 'clsx';

export default function SearchBar({
  placeholder = 'Search...',
  value,
  onChange,
  className = ''
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={clsx('relative', className)}>
      <div
        className={clsx(
          'absolute left-4 top-1/2 -translate-y-1/2 transition-opacity',
          (isFocused || value) ? 'opacity-0' : 'opacity-100'
        )}
      >
        <svg className="w-5 h-5 text-slate-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={clsx(
          'w-full h-12 py-3 rounded-xl border bg-white dark:bg-zinc-900',
          'text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          'border-slate-300 dark:border-zinc-700',
          (isFocused || value) ? 'px-4' : 'pl-12 pr-4'
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
