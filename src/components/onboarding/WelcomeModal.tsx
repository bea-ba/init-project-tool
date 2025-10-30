import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Moon, Bell, TrendingUp, Music, ArrowRight, Sparkles } from 'lucide-react';

interface WelcomeModalProps {
  open: boolean;
  onComplete: () => void;
}

const steps = [
  {
    icon: Moon,
    title: 'Welcome to Dreamwell',
    description: 'Your personal sleep tracking companion designed to help you understand and improve your sleep quality.',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Track Your Sleep',
    description: 'Monitor sleep duration, quality, and patterns. Get detailed insights about your sleep phases and interruptions.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Bell,
    title: 'Smart Alarms',
    description: 'Set intelligent alarms with smart wake windows, relaxing sounds, and bedtime reminders to optimize your sleep schedule.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Music,
    title: 'Relaxation Sounds',
    description: 'Access a library of soothing sounds to help you fall asleep. Set sleep timers with automatic fade-out.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Sparkles,
    title: 'Personalized Insights',
    description: 'Receive AI-powered recommendations based on your sleep data and discover correlations between activities and sleep quality.',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
];

export const WelcomeModal = ({ open, onComplete }: WelcomeModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="relative p-8">
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  scale: index === currentStep ? 1.2 : 1,
                  opacity: index === currentStep ? 1 : 0.3,
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-600'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className={`inline-flex p-6 rounded-full ${step.bgColor} mb-6`}
              >
                <Icon className={`h-12 w-12 ${step.color}`} />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold mb-4 text-white"
              >
                {step.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-300 leading-relaxed mb-8"
              >
                {step.description}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            {currentStep < steps.length - 1 ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Get Started <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
