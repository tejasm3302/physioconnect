import clsx from 'clsx';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className = ''
}) {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-zinc-800 mb-4">
          <Icon className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-slate-500 dark:text-zinc-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && actionLabel && (
        <Button onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
