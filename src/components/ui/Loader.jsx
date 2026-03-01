import clsx from 'clsx';

const sizes = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
};

export default function Loader({ size = 'md', className = '' }) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-2 border-primary-200 border-t-primary-600',
          sizes[size]
        )}
      />
    </div>
  );
}
