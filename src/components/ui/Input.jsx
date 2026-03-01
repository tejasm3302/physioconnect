import { forwardRef, useState } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({
  label,
  error,
  icon,
  type = 'text',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const showIcon = icon && !isFocused && !hasValue;

  return (
    <div className={clsx('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <div className="relative">
        {showIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'w-full h-12 py-3 rounded-xl border bg-white dark:bg-zinc-900',
            'text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300 dark:border-zinc-700',
            showIcon ? 'pl-12 pr-4' : 'px-4',
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
