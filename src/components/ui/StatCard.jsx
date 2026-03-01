import clsx from 'clsx';
import { motion } from 'framer-motion';

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  className = ''
}) {
  const variants = {
    default: 'bg-white dark:bg-zinc-900',
    primary: 'bg-primary-50 dark:bg-primary-900/20',
    success: 'bg-lime-50 dark:bg-lime-900/20',
    warning: 'bg-amber-50 dark:bg-amber-900/20',
    danger: 'bg-red-50 dark:bg-red-900/20'
  };

  const iconColors = {
    default: 'text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800',
    primary: 'text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-900/50',
    success: 'text-lime-600 dark:text-lime-400 bg-lime-100 dark:bg-lime-900/50',
    warning: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50',
    danger: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'p-6 rounded-xl border border-slate-200 dark:border-zinc-800',
        variants[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-800 dark:text-zinc-100">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={clsx(
                  'text-sm font-medium',
                  trend === 'up' ? 'text-lime-600' : 'text-red-500'
                )}
              >
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-500">
                vs last month
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl', iconColors[variant])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
