import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-zinc-950 px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-8xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-zinc-100 mb-4">Page Not Found</h1>
        <p className="text-slate-600 dark:text-zinc-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/"><Button>Go Home</Button></Link>
      </motion.div>
    </div>
  );
}
