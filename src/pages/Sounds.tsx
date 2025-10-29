import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, Cloud, Waves, TreePine, Zap, Music, Wind } from 'lucide-react';
import { useSleep } from '@/contexts/SleepContext';

const SOUNDS = [
  { id: 'rain', name: 'Rain', category: 'nature', icon: Cloud, premium: false },
  { id: 'ocean', name: 'Ocean Waves', category: 'nature', icon: Waves, premium: false },
  { id: 'forest', name: 'Forest', category: 'nature', icon: TreePine, premium: false },
  { id: 'thunderstorm', name: 'Thunderstorm', category: 'nature', icon: Zap, premium: true },
  { id: 'white-noise', name: 'White Noise', category: 'noise', icon: Wind, premium: false },
  { id: 'pink-noise', name: 'Pink Noise', category: 'noise', icon: Wind, premium: true },
  { id: 'piano', name: 'Piano Melody', category: 'classical', icon: Music, premium: true },
  { id: 'strings', name: 'String Quartet', category: 'classical', icon: Music, premium: true },
];

const SLEEP_TIMERS = [5, 10, 15, 30, 45, 60];

const Sounds = () => {
  const { settings } = useSleep();
  const navigate = useNavigate();
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [volume, setVolume] = useState([70]);
  const [selectedTimer, setSelectedTimer] = useState(30);

  const handlePlayPause = (soundId: string, premium: boolean) => {
    if (premium && !settings.premium) {
      navigate('/premium');
      return;
    }

    if (playingSound === soundId) {
      setPlayingSound(null);
    } else {
      setPlayingSound(soundId);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Relaxation Sounds</h1>
          <Button variant="ghost" onClick={() => navigate('/')} className="md:hidden">
            Back
          </Button>
        </div>

        {/* Now Playing Card */}
        {playingSound && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">Now Playing</p>
              <h3 className="text-2xl font-bold">
                {SOUNDS.find(s => s.id === playingSound)?.name}
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{volume[0]}%</span>
                </div>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">Sleep Timer</p>
                <div className="grid grid-cols-6 gap-2">
                  {SLEEP_TIMERS.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTimer(time)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedTimer === time
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-primary/20'
                      }`}
                    >
                      {time}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Sound Categories */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Nature Sounds</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SOUNDS.filter(s => s.category === 'nature').map((sound) => {
                const Icon = sound.icon;
                const isPlaying = playingSound === sound.id;
                return (
                  <Card
                    key={sound.id}
                    className={`relative overflow-hidden transition-all hover:scale-105 ${
                      isPlaying ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <button
                      onClick={() => handlePlayPause(sound.id, sound.premium)}
                      className="w-full p-6 text-center"
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        isPlaying ? 'bg-primary/20 animate-pulse' : 'bg-muted'
                      }`}>
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-primary" />
                        ) : (
                          <Icon className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-semibold mb-1">{sound.name}</p>
                      {sound.premium && !settings.premium && (
                        <span className="text-xs text-warning">Premium</span>
                      )}
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">White & Pink Noise</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SOUNDS.filter(s => s.category === 'noise').map((sound) => {
                const Icon = sound.icon;
                const isPlaying = playingSound === sound.id;
                return (
                  <Card
                    key={sound.id}
                    className={`relative overflow-hidden transition-all hover:scale-105 ${
                      isPlaying ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <button
                      onClick={() => handlePlayPause(sound.id, sound.premium)}
                      className="w-full p-6 text-center"
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        isPlaying ? 'bg-primary/20 animate-pulse' : 'bg-muted'
                      }`}>
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-primary" />
                        ) : (
                          <Icon className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-semibold mb-1">{sound.name}</p>
                      {sound.premium && !settings.premium && (
                        <span className="text-xs text-warning">Premium</span>
                      )}
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Classical Music</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SOUNDS.filter(s => s.category === 'classical').map((sound) => {
                const Icon = sound.icon;
                const isPlaying = playingSound === sound.id;
                return (
                  <Card
                    key={sound.id}
                    className={`relative overflow-hidden transition-all hover:scale-105 ${
                      isPlaying ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <button
                      onClick={() => handlePlayPause(sound.id, sound.premium)}
                      className="w-full p-6 text-center"
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        isPlaying ? 'bg-primary/20 animate-pulse' : 'bg-muted'
                      }`}>
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-primary" />
                        ) : (
                          <Icon className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-semibold mb-1">{sound.name}</p>
                      {sound.premium && !settings.premium && (
                        <span className="text-xs text-warning">Premium</span>
                      )}
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {!settings.premium && (
          <Card className="p-6 mt-8 bg-gradient-to-r from-warning/10 to-accent/10">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Unlock All Sounds</h3>
              <p className="text-muted-foreground mb-4">
                Get access to all premium sounds and mix multiple tracks
              </p>
              <Button onClick={() => navigate('/premium')}>
                Upgrade to Premium
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Sounds;
