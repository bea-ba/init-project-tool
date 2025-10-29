import { useSleep } from '@/contexts/SleepContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const FEATURES = [
  { name: 'Sleep Tracking', free: true, premium: true },
  { name: 'Basic Alarms', free: true, premium: true },
  { name: '7-Day History', free: true, premium: false },
  { name: 'Unlimited History', free: false, premium: true },
  { name: 'Basic Sounds (3)', free: true, premium: false },
  { name: 'All Premium Sounds', free: false, premium: true },
  { name: 'Sound Mixing', free: false, premium: true },
  { name: 'Advanced Analytics', free: false, premium: true },
  { name: 'Sleep Notes', free: true, premium: true },
  { name: 'Sound Recording', free: false, premium: true },
  { name: 'Snore Detection', free: false, premium: true },
  { name: 'Data Export', free: false, premium: true },
  { name: 'Priority Support', free: false, premium: true },
  { name: 'Ad-Free Experience', free: false, premium: true },
];

const PRICING = [
  { duration: '1 Month', price: '$4.99', save: null, popular: false },
  { duration: '3 Months', price: '$11.99', save: 'Save 20%', popular: true },
  { duration: '1 Year', price: '$29.99', save: 'Save 50%', popular: false },
];

const Premium = () => {
  const { settings, updateSettings } = useSleep();
  const navigate = useNavigate();

  const handleSubscribe = (plan: string) => {
    // Simulate subscription
    updateSettings({ ...settings, premium: true });
    toast.success(`Subscribed to ${plan} plan!`);
    setTimeout(() => navigate('/'), 1500);
  };

  const handleRestore = () => {
    toast.info('No purchases to restore');
  };

  if (settings.premium) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-6">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Premium</h1>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back
            </Button>
          </div>

          <Card className="p-8 text-center bg-gradient-to-br from-warning/20 to-accent/20">
            <Crown className="w-16 h-16 mx-auto mb-4 text-warning" />
            <h2 className="text-2xl font-bold mb-2">You're Premium!</h2>
            <p className="text-muted-foreground mb-6">
              Enjoy all the features Dreamwell has to offer
            </p>
            <Button onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Unlock Premium</h1>
          <Button variant="ghost" onClick={() => navigate('/')} className="md:hidden">
            Back
          </Button>
        </div>

        {/* Hero */}
        <Card className="p-8 mb-8 text-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-fade-in">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary animate-float" />
          <h2 className="text-3xl font-bold font-heading mb-3">Elevate Your Rest</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access unlimited insights, soothing sounds, and personalized guidance for truly restorative sleep
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
                  Most Popular
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">{plan.duration}</h3>
                <div className="text-4xl font-bold mb-2">{plan.price}</div>
                {plan.save && (
                  <span className="text-sm text-success font-semibold">{plan.save}</span>
                )}
              </div>

              <Button
                onClick={() => handleSubscribe(plan.duration)}
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                Start Free Trial
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                7-day free trial, then {plan.price}
              </p>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Features Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4">{feature.name}</td>
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
            { name: 'Sarah M.', text: 'Premium has completely transformed my sleep quality!' },
            { name: 'John D.', text: 'The advanced analytics helped me identify sleep patterns I never knew existed.' },
            { name: 'Emily R.', text: 'Best investment in my health. Sleep better every night!' },
          ].map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-warning">★</span>
                ))}
              </div>
              <p className="text-sm mb-3 italic">"{testimonial.text}"</p>
              <p className="text-sm font-semibold">— {testimonial.name}</p>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <Button variant="ghost" onClick={handleRestore}>
            Restore Purchase
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Subscription automatically renews unless cancelled 24 hours before the end of the current period.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;
