import clsx from 'clsx';
import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary-500',
  success: 'bg-lime-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500'
};

export default function ProgressBar({
  value,
  max = 100,
  variant = 'primary',
  showLabel = false,
  size = 'md',
  className = ''
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
            Progress
          </span>
          <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={clsx('w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={clsx('h-full rounded-full', variants[variant])}
        />
      </div>
    </div>
  );
}
