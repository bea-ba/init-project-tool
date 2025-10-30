import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export const SuccessAnimation = ({
  message = 'Success!',
  onComplete,
  duration = 2000
}: SuccessAnimationProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative"
      >
        {/* Sparkles around the circle */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: Math.cos((i * Math.PI * 2) / 8) * 60,
              y: Math.sin((i * Math.PI * 2) / 8) * 60,
            }}
            transition={{
              duration: 1,
              delay: 0.2 + i * 0.1,
              repeat: Infinity,
              repeatDelay: 1
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </motion.div>
        ))}

        {/* Main success circle */}
        <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-8 shadow-2xl">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.2, duration: 0.6 }}
          >
            <Check className="h-16 w-16 text-white stroke-[3]" />
          </motion.div>

          {/* Ripple effect */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 0.9
              }}
              className="absolute inset-0 rounded-full border-4 border-green-400"
            />
          ))}
        </div>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-xl font-semibold text-white"
        >
          {message}
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export const QuickSuccessToast = ({ message }: { message: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', delay: 0.1 }}
      >
        <Check className="h-5 w-5" />
      </motion.div>
      <span className="font-medium">{message}</span>
    </motion.div>
  );
};
