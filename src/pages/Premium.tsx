import { useSleep } from '@/contexts/SleepContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

const FEATURES = [
  { translationKey: 'premium.features.sleepTracking', free: true, premium: true },
  { translationKey: 'premium.features.basicAlarms', free: true, premium: true },
  { translationKey: 'premium.features.basicHistory', free: true, premium: false },
  { translationKey: 'premium.features.unlimitedHistory', free: false, premium: true },
  { translationKey: 'premium.features.basicSounds', free: true, premium: false },
  { translationKey: 'premium.features.allSounds', free: false, premium: true },
  { translationKey: 'premium.features.soundMixing', free: false, premium: true },
  { translationKey: 'premium.features.advancedAnalytics', free: false, premium: true },
  { translationKey: 'premium.features.sleepNotes', free: true, premium: true },
  { translationKey: 'premium.features.soundRecording', free: false, premium: true },
  { translationKey: 'premium.features.snoreDetection', free: false, premium: true },
  { translationKey: 'premium.features.dataExport', free: false, premium: true },
  { translationKey: 'premium.features.prioritySupport', free: false, premium: true },
  { translationKey: 'premium.features.adFree', free: false, premium: true },
];

const PRICING = [
  { duration: 'premium.pricing.monthly', price: '$4.99', save: null, popular: false },
  { duration: 'premium.pricing.threeMonths', price: '$11.99', save: 'premium.pricing.save20', popular: true },
  { duration: 'premium.pricing.yearly', price: '$29.99', save: 'premium.pricing.save50', popular: false },
];

const Premium = () => {
  const { settings, updateSettings } = useSleep();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubscribe = (plan: string) => {
    // Simulate subscription
    updateSettings({ ...settings, premium: true });
    toast.success(t('premium.subscribeSuccess', { plan }));
    setTimeout(() => navigate('/'), 1500);
  };

  const handleRestore = () => {
    toast.info(t('premium.noPurchasesToRestore'));
  };

  if (settings.premium) {
    return (
      <div className="min-h-[100dvh] bg-background pb-20 md:pb-6 overflow-x-hidden">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">{t('premium.title')}</h1>
            <Button variant="ghost" onClick={() => navigate('/')}>
              {t('common.back')}
            </Button>
          </div>

          <Card className="p-8 text-center bg-gradient-to-br from-warning/20 to-accent/20">
            <Crown className="w-16 h-16 mx-auto mb-4 text-warning" />
            <h2 className="text-2xl font-bold mb-2">{t('premium.yourePremium')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('premium.enjoyAllFeatures')}
            </p>
            <Button onClick={() => navigate('/')}>
              {t('premium.backToDashboard')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">{t('premium.unlock')}</h1>
          <Button variant="ghost" onClick={() => navigate('/')} className="md:hidden">
            {t('common.back')}
          </Button>
        </div>

        {/* Hero */}
        <Card className="p-8 mb-8 text-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-fade-in">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary animate-float" />
          <h2 className="text-3xl font-bold font-heading mb-3">{t('premium.elevateRest')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('premium.elevateRestDesc')}
          </p>
        </Card>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PRICING.map((plan) => (
            <Card
              key={plan.duration}
              className={`p-6 relative ${
                plan.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                  {t('premium.mostPopular')}
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">{t(plan.duration)}</h3>
                <div className="text-4xl font-bold mb-2">{plan.price}</div>
                {plan.save && (
                  <span className="text-sm text-success font-semibold">{t(plan.save)}</span>
                )}
              </div>

              <Button
                onClick={() => handleSubscribe(t(plan.duration))}
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {t('premium.startFreeTrial')}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                {t('premium.trialInfo', { price: plan.price })}
              </p>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">{t('premium.featuresComparison')}</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">{t('premium.feature')}</th>
                  <th className="text-center p-4 font-semibold">{t('premium.free')}</th>
                  <th className="text-center p-4 font-semibold">{t('premium.title')}</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4">{t(feature.translationKey)}</td>
                    <td className="text-center p-4">
                      {feature.free ? (
                        <Check className="w-5 h-5 text-success mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                    <td className="text-center p-4">
                      {feature.premium ? (
                        <Check className="w-5 h-5 text-success mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { nameKey: 'premium.testimonials.sarah', textKey: 'premium.testimonials.sarahText' },
            { nameKey: 'premium.testimonials.john', textKey: 'premium.testimonials.johnText' },
            { nameKey: 'premium.testimonials.emily', textKey: 'premium.testimonials.emilyText' },
          ].map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-warning">★</span>
                ))}
              </div>
              <p className="text-sm mb-3 italic">"{t(testimonial.textKey)}"</p>
              <p className="text-sm font-semibold">— {t(testimonial.nameKey)}</p>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <Button variant="ghost" onClick={handleRestore}>
            {t('premium.restorePurchase')}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            {t('premium.autoRenewal')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;
