import { useState } from 'react';
import { useSleep } from '@/contexts/SleepContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Coffee, Dumbbell, Wine, Pizza, Brain, BookOpen } from 'lucide-react';
import { generateSecureId } from '@/utils/encryption';
import { sanitizeNoteText } from '@/utils/validation';
import { useLanguage } from '@/hooks/useLanguage';

const TAGS = [
  { id: 'exercise', label: 'Exercise', icon: Dumbbell, translationKey: 'notes.exercise' },
  { id: 'caffeine', label: 'Caffeine', icon: Coffee, translationKey: 'notes.caffeine' },
  { id: 'alcohol', label: 'Alcohol', icon: Wine, translationKey: 'notes.alcohol' },
  { id: 'heavy-meal', label: 'Heavy Meal', icon: Pizza, translationKey: 'notes.heavyMeal' },
  { id: 'stress', label: 'Stressed', icon: Brain, translationKey: 'notes.stress' },
  { id: 'reading', label: 'Read Before Bed', icon: BookOpen, translationKey: 'notes.reading' },
];

const SleepNotes = () => {
  const { addNote } = useSleep();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [moodBefore, setMoodBefore] = useState(3);
  const [moodAfter, setMoodAfter] = useState(3);

  const handleSave = () => {
    const sanitizedText = sanitizeNoteText(text);

    if (!sanitizedText.trim()) {
      toast.error(t('notes.addNotesError'));
      return;
    }

    if (sanitizedText.length > 1000) {
      toast.error(t('notes.noteTooLong'));
      return;
    }

    if (selectedTags.length > 10) {
      toast.error(t('notes.maxTagsError'));
      return;
    }

    const note = {
      id: generateSecureId(),
      date: new Date(),
      text: sanitizedText,
      tags: selectedTags,
      activities: {
        exercise: (selectedTags.includes('exercise') ? 'evening' : null) as 'morning' | 'afternoon' | 'evening' | null,
        caffeine: selectedTags.includes('caffeine') ? ['afternoon'] : [],
        alcohol: selectedTags.includes('alcohol'),
        heavyMeal: selectedTags.includes('heavy-meal'),
        stress: selectedTags.includes('stress') ? 4 : 2,
        screenTime: 60,
        nap: false,
      },
      moodBefore,
      moodAfter,
    };

    addNote(note);
    toast.success(t('notes.noteSaved'));
    navigate('/');
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-6 overflow-x-hidden">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{t('notes.title')}</h1>
          <Button variant="ghost" onClick={() => navigate('/')}>
            {t('common.cancel')}
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <Label htmlFor="notes">{t('notes.howWasYourRest')}</Label>
          <Textarea
            id="notes"
            placeholder={t('notes.placeholder')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 min-h-[120px]"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('notes.characterCount', { count: text.length })}
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <Label className="mb-4 block">{t('notes.activities')}</Label>
          <div className="grid grid-cols-2 gap-3">
            {TAGS.map((tag) => {
              const Icon = tag.icon;
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                    {t(tag.translationKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <Label className="mb-4 block">{t('notes.moodBefore')}</Label>
          <div className="flex gap-2 justify-between mb-6">
            {[1, 2, 3, 4, 5].map((mood) => (
              <button
                key={mood}
                onClick={() => setMoodBefore(mood)}
                className={`w-12 h-12 rounded-full font-bold transition-all ${
                  moodBefore === mood
                    ? 'bg-primary text-primary-foreground scale-110'
                    : 'bg-muted text-muted-foreground hover:bg-primary/20'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>

          <Label className="mb-4 block">{t('notes.moodAfter')}</Label>
          <div className="flex gap-2 justify-between">
            {[1, 2, 3, 4, 5].map((mood) => (
              <button
                key={mood}
                onClick={() => setMoodAfter(mood)}
                className={`w-12 h-12 rounded-full font-bold transition-all ${
                  moodAfter === mood
                    ? 'bg-success text-success-foreground scale-110'
                    : 'bg-muted text-muted-foreground hover:bg-success/20'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </Card>

        <Button onClick={handleSave} size="lg" className="w-full">
          {t('notes.saveNote')}
        </Button>
      </div>
    </div>
  );
};

export default SleepNotes;
