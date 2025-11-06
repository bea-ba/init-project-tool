import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, Cloud, Waves, TreePine, Zap, Music, Wind, StopCircle, Timer } from 'lucide-react';
import { useSleep } from '@/contexts/SleepContext';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { SoundId } from '@/utils/audioPlayer';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

const SOUNDS = [
  { id: 'rain' as SoundId, translationKey: 'sounds.rain', category: 'nature', icon: Cloud, premium: false },
  { id: 'ocean' as SoundId, translationKey: 'sounds.ocean', category: 'nature', icon: Waves, premium: false },
  { id: 'forest' as SoundId, translationKey: 'sounds.forest', category: 'nature', icon: TreePine, premium: false },
  { id: 'thunderstorm' as SoundId, translationKey: 'sounds.thunderstorm', category: 'nature', icon: Zap, premium: true },
  { id: 'white-noise' as SoundId, translationKey: 'sounds.whiteNoise', category: 'noise', icon: Wind, premium: false },
  { id: 'pink-noise' as SoundId, translationKey: 'sounds.pinkNoise', category: 'noise', icon: Wind, premium: true },
  { id: 'piano' as SoundId, translationKey: 'sounds.piano', category: 'classical', icon: Music, premium: true },
  { id: 'strings' as SoundId, translationKey: 'sounds.strings', category: 'classical', icon: Music, premium: true },
];

const SLEEP_TIMERS = [5, 10, 15, 30, 45, 60];

const Sounds = () => {
  const { settings } = useSleep();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const {
    playingSound,
    volume,
    timerMinutes,
    toggleSound,
    stopAll,
    setVolume,
    setSleepTimer,
    clearTimer,
    isPlaying,
  } = useAudioPlayer();

  // Show toast when timer is set
  useEffect(() => {
    if (timerMinutes) {
      toast.success(t('sounds.timerSet', { minutes: timerMinutes }), {
        description: t('sounds.timerDescription'),
      });
    }
  }, [timerMinutes]);

  const handlePlayPause = (soundId: SoundId, premium: boolean) => {
    if (premium && !settings.premium) {
      navigate('/premium');
      return;
    }

    toggleSound(soundId);
  };

  const handleTimerSelect = (minutes: number) => {
    if (!playingSound) {
      toast.error(t('sounds.playSoundFirst'));
      return;
    }

    setSleepTimer(minutes);
  };

  const handleStopAll = () => {
    stopAll();
    toast.info(t('sounds.playbackStopped'));
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{t('sounds.title')}</h1>
          <Button variant="ghost" onClick={() => navigate('/')} className="md:hidden">
            {t('common.back')}
          </Button>
        </div>

        {/* Now Playing Card */}
        {playingSound && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-secondary/10 animate-fade-in">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">{t('sounds.nowPlaying')}</p>
              <h3 className="text-2xl font-bold">
                {SOUNDS.find(s => s.id === playingSound)?.translationKey ? t(SOUNDS.find(s => s.id === playingSound)!.translationKey) : ''}
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Volume2 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{volume}%</span>
                </div>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{t('sounds.sleepTimer')}</p>
                  </div>
                  {timerMinutes && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearTimer}
                      className="text-xs"
                    >
                      {t('sounds.clear')}
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {SLEEP_TIMERS.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimerSelect(time)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        timerMinutes === time
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-primary/20'
                      }`}
                    >
                      {time}m
                    </button>
                  ))}
                </div>
                {timerMinutes && (
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    {t('sounds.fadeOut', { minutes: timerMinutes })}
                  </p>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleStopAll}
              >
                <StopCircle className="w-4 h-4 mr-2" />
                {t('sounds.stopPlayback')}
              </Button>
            </div>
          </Card>
        )}

        {/* Hint when nothing is playing */}
        {!playingSound && (
          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <p className="text-sm text-center text-muted-foreground">
              {t('sounds.selectSound')}
            </p>
          </Card>
        )}

        {/* Sound Categories */}
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('sounds.natureSounds')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SOUNDS.filter(s => s.category === 'nature').map((sound) => {
                const Icon = sound.icon;
                const playing = isPlaying(sound.id);
                return (
                  <Card
                    key={sound.id}
                    className={`relative overflow-hidden transition-all hover:scale-105 ${
                      playing ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <button
                      onClick={() => handlePlayPause(sound.id, sound.premium)}
                      className="w-full p-6 text-center"
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        playing ? 'bg-primary/20 animate-pulse' : 'bg-muted'
                      }`}>
                        {playing ? (
                          <Pause className="w-8 h-8 text-primary" />
                        ) : (
                          <Play className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-semibold mb-1">{t(sound.translationKey)}</p>
                      {sound.premium && !settings.premium && (
                        <span className="text-xs text-warning">{t('premium.title')}</span>
                      )}
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">{t('sounds.whitePinkNoise')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SOUNDS.filter(s => s.category === 'noise').map((sound) => {
                const Icon = sound.icon;
                const playing = isPlaying(sound.id);
                return (
                  <Card
                    key={sound.id}
                    className={`relative overflow-hidden transition-all hover:scale-105 ${
                      playing ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <button
                      onClick={() => handlePlayPause(sound.id, sound.premium)}
                      className="w-full p-6 text-center"
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        playing ? 'bg-primary/20 animate-pulse' : 'bg-muted'
                      }`}>
                        {playing ? (
                          <Pause className="w-8 h-8 text-primary" />
                        ) : (
                          <Play className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-semibold mb-1">{t(sound.translationKey)}</p>
                      {sound.premium && !settings.premium && (
                        <span className="text-xs text-warning">{t('premium.title')}</span>
                      )}
                    </button>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">{t('sounds.classicalMusic')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SOUNDS.filter(s => s.category === 'classical').map((sound) => {
                const Icon = sound.icon;
                const playing = isPlaying(sound.id);
                return (
                  <Card
                    key={sound.id}
                    className={`relative overflow-hidden transition-all hover:scale-105 ${
                      playing ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <button
                      onClick={() => handlePlayPause(sound.id, sound.premium)}
                      className="w-full p-6 text-center"
                    >
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        playing ? 'bg-primary/20 animate-pulse' : 'bg-muted'
                      }`}>
                        {playing ? (
                          <Pause className="w-8 h-8 text-primary" />
                        ) : (
                          <Play className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="font-semibold mb-1">{t(sound.translationKey)}</p>
                      {sound.premium && !settings.premium && (
                        <span className="text-xs text-warning">{t('premium.title')}</span>
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
              <h3 className="text-xl font-semibold mb-2">{t('sounds.unlockAllSounds')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('sounds.unlockAllSoundsDesc')}
              </p>
              <Button onClick={() => navigate('/premium')}>
                {t('premium.upgrade')}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Sounds;
