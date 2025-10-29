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

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AlarmSetup = () => {
  const { addAlarm } = useSleep();
  const navigate = useNavigate();
  
  const [time, setTime] = useState('07:00');
  const [label, setLabel] = useState('');
  const [days, setDays] = useState<boolean[]>([false, true, true, true, true, true, false]);
  const [smartWake, setSmartWake] = useState(true);
  const [wakeWindow, setWakeWindow] = useState([15]);
  const [vibration, setVibration] = useState(true);

  const handleSave = () => {
    const alarm = {
      id: Date.now().toString(),
      time,
      label: label || 'Alarm',
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
    toast.success('Alarm saved successfully!');
    navigate('/');
  };

  const toggleDay = (index: number) => {
    const newDays = [...days];
    newDays[index] = !newDays[index];
    setDays(newDays);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Smart Alarm</h1>
          <Button variant="ghost" onClick={() => navigate('/')}>
            Cancel
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
          <Label htmlFor="label">Alarm Label</Label>
          <Input
            id="label"
            placeholder="e.g., Workday, Weekend"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-2"
          />
        </Card>

        <Card className="p-6 mb-6">
          <Label className="mb-4 block">Repeat on</Label>
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
                <Label>Smart Wake</Label>
                <p className="text-sm text-muted-foreground">
                  Wake you during light sleep
                </p>
              </div>
            </div>
            <Switch checked={smartWake} onCheckedChange={setSmartWake} />
          </div>

          {smartWake && (
            <div className="mt-4">
              <Label>Wake Window: {wakeWindow[0]} minutes</Label>
              <Slider
                value={wakeWindow}
                onValueChange={setWakeWindow}
                min={0}
                max={30}
                step={5}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Alarm can trigger up to {wakeWindow[0]} minutes before {time}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Vibrate className="w-5 h-5 text-primary" />
              <Label>Vibration</Label>
            </div>
            <Switch checked={vibration} onCheckedChange={setVibration} />
          </div>
        </Card>

        <Button onClick={handleSave} size="lg" className="w-full">
          Save Alarm
        </Button>
      </div>
    </div>
  );
};

export default AlarmSetup;
