import clsx from 'clsx';
import { motion } from 'framer-motion';

const variants = {
  stat: 'p-6 rounded-xl',
  list: 'p-5 rounded-xl',
  feature: 'p-6 rounded-2xl',
  pricing: 'p-8 rounded-2xl'
};

export default function Card({
  children,
  variant = 'feature',
  className = '',
  hover = false,
  onClick,
  ...props
}) {
  const Component = hover || onClick ? motion.div : 'div';
  const motionProps = hover || onClick ? {
    whileHover: { scale: 1.02, y: -4 },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  } : {};

  return (
    <Component
      className={clsx(
        'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm',
        variants[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
}
