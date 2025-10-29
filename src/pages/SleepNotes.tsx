import { useState } from 'react';
import { useSleep } from '@/contexts/SleepContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Coffee, Dumbbell, Wine, Pizza, Brain, BookOpen } from 'lucide-react';

const TAGS = [
  { id: 'exercise', label: 'Exercise', icon: Dumbbell },
  { id: 'caffeine', label: 'Caffeine', icon: Coffee },
  { id: 'alcohol', label: 'Alcohol', icon: Wine },
  { id: 'heavy-meal', label: 'Heavy Meal', icon: Pizza },
  { id: 'stress', label: 'Stressed', icon: Brain },
  { id: 'reading', label: 'Read Before Bed', icon: BookOpen },
];

const SleepNotes = () => {
  const { addNote } = useSleep();
  const navigate = useNavigate();
  
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [moodBefore, setMoodBefore] = useState(3);
  const [moodAfter, setMoodAfter] = useState(3);

  const handleSave = () => {
    if (!text.trim()) {
      toast.error('Please add some notes');
      return;
    }

    const note = {
      id: Date.now().toString(),
      date: new Date(),
      text,
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
    toast.success('Note saved successfully!');
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
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Sleep Note</h1>
          <Button variant="ghost" onClick={() => navigate('/')}>
            Cancel
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <Label htmlFor="notes">How did you sleep?</Label>
          <Textarea
            id="notes"
            placeholder="Write about your sleep experience, dreams, or anything that might have affected your rest..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-2 min-h-[120px]"
          />
        </Card>

        <Card className="p-6 mb-6">
          <Label className="mb-4 block">Activities & Factors</Label>
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
                    {tag.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <Label className="mb-4 block">Mood Before Sleep</Label>
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

          <Label className="mb-4 block">Mood After Waking</Label>
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
          Save Note
        </Button>
      </div>
    </div>
  );
};

export default SleepNotes;
