import { forwardRef } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-accent-500 text-zinc-900 hover:bg-accent-400 shadow-lg shadow-accent-500/25',
  secondary: 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/25',
  ghost: 'border-2 border-slate-300 dark:border-zinc-600 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800',
  tertiary: 'text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800',
  danger: 'bg-red-500 text-white hover:bg-red-400 shadow-lg shadow-red-500/25'
};

const sizes = {
  sm: 'h-9 px-4 py-2 text-sm gap-2',
  md: 'h-11 px-6 py-3 text-base gap-2',
  lg: 'h-13 px-8 py-4 text-lg gap-3'
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900',
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className={clsx('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])} />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={iconSizes[size]} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className={iconSizes[size]} />}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
