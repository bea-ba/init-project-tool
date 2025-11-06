import { useState } from 'react';
import { useSleep } from '@/contexts/SleepContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { AlarmClock, Bell, Vibrate } from 'lucide-react';
import { toast } from 'sonner';
import { generateSecureId } from '@/utils/encryption';
import { sanitizeAlarmLabel } from '@/utils/validation';
import { useLanguage } from '@/hooks/useLanguage';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AlarmSetup = () => {
  const { addAlarm } = useSleep();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [time, setTime] = useState('07:00');
  const [label, setLabel] = useState('');
  const [days, setDays] = useState<boolean[]>([false, true, true, true, true, true, false]);
  const [smartWake, setSmartWake] = useState(true);
  const [wakeWindow, setWakeWindow] = useState([15]);
  const [vibration, setVibration] = useState(true);

  const handleSave = () => {
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      toast.error(t('alarms.invalidTimeFormat'));
      return;
    }

    // Sanitize and validate label
    const sanitizedLabel = sanitizeAlarmLabel(label);
    if (sanitizedLabel.length > 100) {
      toast.error(t('alarms.labelTooLong'));
      return;
    }

    // Validate at least one day is selected
    if (!days.some(day => day)) {
      toast.error(t('alarms.selectOneDay'));
      return;
    }

    const alarm = {
      id: generateSecureId(),
      time,
      label: sanitizedLabel || 'Alarm',
      days,
      enabled: true,
      soundId: 'gentle-wake',
      smartWake,
      wakeWindow: wakeWindow[0],
      vibration,
      snooze: {
        duration: 5,
        maxCount: 3,
      },
    };

    addAlarm(alarm);
    toast.success(t('alarms.alarmSaved'));
    navigate('/');
  };

  const toggleDay = (index: number) => {
    const newDays = [...days];
    newDays[index] = !newDays[index];
    setDays(newDays);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-6 overflow-x-hidden">
      <div className="w-full px-4 sm:px-6 md:max-w-2xl md:mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold truncate pr-2">{t('alarms.smartAlarm')}</h1>
          <Button variant="ghost" onClick={() => navigate('/')}>
            {t('common.cancel')}
          </Button>
        </div>

        <Card className="p-6 mb-6 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="flex items-center justify-center mb-4">
            <AlarmClock className="w-12 h-12 text-primary" />
          </div>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="text-4xl font-bold text-center h-20 border-none bg-transparent"
          />
        </Card>

        <Card className="p-6 mb-6">
          <Label htmlFor="label">{t('alarms.label')}</Label>
          <Input
            id="label"
            placeholder={t('alarms.labelPlaceholder')}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-2"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('alarms.characterCount', { count: label.length })}
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <Label className="mb-4 block">{t('alarms.repeatOn')}</Label>
          <div className="flex gap-2 justify-between">
            {DAYS.map((day, index) => (
              <button
                key={day}
                onClick={() => toggleDay(index)}
                className={`w-12 h-12 rounded-full font-semibold transition-colors ${
                  days[index]
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {day[0]}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <Label>{t('alarms.smartWake')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('alarms.smartWakeDesc')}
                </p>
              </div>
            </div>
            <Switch checked={smartWake} onCheckedChange={setSmartWake} />
          </div>

          {smartWake && (
            <div className="mt-4">
              <Label>{t('alarms.wakeWindow', { minutes: wakeWindow[0] })}</Label>
              <Slider
                value={wakeWindow}
                onValueChange={setWakeWindow}
                min={0}
                max={30}
                step={5}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {t('alarms.wakeWindowDesc', { minutes: wakeWindow[0], time })}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className="w-5 h-5 text-primary" />
              <Label>{t('alarms.vibration')}</Label>
            </div>
            <Switch checked={vibration} onCheckedChange={setVibration} />
          </div>
        </Card>

        <Button onClick={handleSave} size="lg" className="w-full">
          {t('alarms.saveAlarm')}
        </Button>
      </div>
    </div>
  );
};

export default AlarmSetup;
