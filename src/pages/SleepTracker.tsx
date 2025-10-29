import { useState, useEffect } from 'react';
import { useSleep } from '@/contexts/SleepContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Moon, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateSleepPhases, calculateSleepQuality } from '@/utils/sleepCalculations';

const SleepTracker = () => {
  const { activeSleep, startSleep, stopSleep, addSession } = useSleep();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleStartSleep = () => {
    const newSession = {
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: null,
      duration: 0,
      quality: 0,
      phases: {
        awake: 0,
        light: 0,
        deep: 0,
        rem: 0,
      },
      interruptions: 0,
      notes: '',
      soundRecordings: [],
      environment: {
        noise: 0,
      },
    };
    startSleep(newSession);
  };

  const handleStopSleep = () => {
    if (!activeSleep) return;

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - activeSleep.startTime.getTime()) / 60000);
    const phases = generateSleepPhases(duration);
    const interruptions = Math.floor(Math.random() * 3);

    const completedSession = {
      ...activeSleep,
      endTime,
      duration,
      phases,
      interruptions,
      quality: 0,
    };

    completedSession.quality = calculateSleepQuality(completedSession);

    addSession(completedSession);
    stopSleep();
    navigate('/');
  };

  const getSleepDuration = () => {
    if (!activeSleep) return '0:00:00';
    const diff = currentTime.getTime() - activeSleep.startTime.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 pb-20 md:pb-6">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Sleep Tracker</h1>
          <Button variant="ghost" onClick={() => navigate('/')}>
            Back
          </Button>
        </div>

        <Card className="p-8 mb-8 bg-gradient-to-br from-card to-primary/10">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center animate-breathe">
                <Moon className="w-16 h-16 text-primary animate-float" />
              </div>
            </div>

            {activeSleep ? (
              <>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Sleep Duration</p>
                  <p className="text-5xl font-bold tracking-wider">{getSleepDuration()}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Started at {activeSleep.startTime.toLocaleTimeString()}
                  </p>
                </div>
              </>
            ) : (
            <div className="text-center">
              <p className="text-2xl font-semibold mb-2">Ready for Restful Sleep?</p>
              <p className="text-muted-foreground">
                Begin tracking to discover your sleep patterns
              </p>
            </div>
            )}
          </div>
        </Card>

        {activeSleep && (
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Sleep Phase</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Light Sleep</span>
                <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary/50 animate-pulse" style={{ width: '60%' }} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Monitoring your sleep patterns...
              </p>
            </div>
          </Card>
        )}

        <div className="flex justify-center">
          {activeSleep ? (
            <Button
              size="lg"
              variant="destructive"
              onClick={handleStopSleep}
              className="w-full max-w-xs h-16 text-lg"
            >
              <Square className="w-6 h-6 mr-2" />
              Stop Tracking
            </Button>
          ) : (
          <Button
            size="lg"
            onClick={handleStartSleep}
            className="w-full max-w-xs h-16 text-lg"
          >
            <Moon className="w-6 h-6 mr-2" />
            Begin Sleep Journey
          </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SleepTracker;
