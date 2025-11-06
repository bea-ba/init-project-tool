import { useSleep } from '@/contexts/SleepContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Bell, Download, Upload, Trash2, Shield, FileText } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { downloadDataAsJSON, downloadSessionsAsCSV, handleFileImport } from '@/utils/dataExport';
import { promptForNotificationPermission } from '@/utils/notifications';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/hooks/useLanguage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Settings = () => {
  const { settings, updateSettings } = useSleep();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [sleepGoalHours, setSleepGoalHours] = useState([settings.sleepGoal / 60]);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    updateSettings({ ...settings, theme });
    toast.success('Theme updated');
  };

  const handleSaveGoal = () => {
    updateSettings({ ...settings, sleepGoal: sleepGoalHours[0] * 60 });
    toast.success('Sleep goal updated');
  };

  const handleToggleNotification = (key: keyof typeof settings.notifications) => {
    updateSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key],
      },
    });
  };

  const handleExportJSON = () => {
    try {
      downloadDataAsJSON();
      toast.success('Data exported successfully as JSON');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      downloadSessionsAsCSV();
      toast.success('Sleep sessions exported as CSV');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await handleFileImport(file);

      if (result.success) {
        toast.success(result.message);
        // Reload to reflect imported data
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to import data');
      console.error('Import error:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    setShowClearDialog(true);
  };

  const confirmClearData = () => {
    localStorage.clear();
    toast.success('All data cleared');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-6 overflow-x-hidden">
      <div className="w-full px-4 sm:px-6 md:max-w-4xl md:mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold truncate pr-2">{t('settings.title')}</h1>
          <Button variant="ghost" onClick={() => navigate('/')} className="md:hidden flex-shrink-0">
            {t('common.back')}
          </Button>
        </div>

        {/* Language Selector */}
        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-1">{t('settings.language')}</h2>
              <p className="text-sm text-muted-foreground">
                Choose your preferred language
              </p>
            </div>
            <LanguageSwitcher />
          </div>
        </Card>

        {/* Sleep Goals */}
        <Card className="p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('settings.sleepGoal')}</h2>

          <div className="space-y-6">
            <div>
              <Label>{t('settings.targetDuration')}: {sleepGoalHours[0].toFixed(1)} {t('dashboard.hours')}</Label>
              <Slider
                value={sleepGoalHours}
                onValueChange={setSleepGoalHours}
                min={5}
                max={10}
                step={0.5}
                className="mt-3"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Recommended: 7-9 hours per night
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bedtime">{t('settings.idealBedtime')}</Label>
                <Input
                  id="bedtime"
                  type="time"
                  value={settings.idealBedtime}
                  onChange={(e) => updateSettings({ ...settings, idealBedtime: e.target.value })}
                  className="mt-2 w-full"
                />
              </div>
              <div>
                <Label htmlFor="waketime">{t('settings.idealWakeTime')}</Label>
                <Input
                  id="waketime"
                  type="time"
                  value={settings.idealWakeTime}
                  onChange={(e) => updateSettings({ ...settings, idealWakeTime: e.target.value })}
                  className="mt-2 w-full"
                />
              </div>
            </div>

            <Button onClick={handleSaveGoal} className="w-full">
              {t('settings.saveGoals')}
            </Button>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('settings.appearance')}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.theme === 'light'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Sun className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">{t('settings.light')}</p>
            </button>

            <button
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.theme === 'dark'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Moon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">{t('settings.dark')}</p>
            </button>

            <button
              onClick={() => handleThemeChange('auto')}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.theme === 'auto'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex justify-center gap-1 mb-2">
                <Sun className="w-3 h-3" />
                <Moon className="w-3 h-3" />
              </div>
              <p className="text-sm font-medium">{t('settings.auto')}</p>
            </button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.notifications')}</h2>

          <div className="space-y-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm mb-3">
                {t('settings.pushNotificationsDesc')}
              </p>
              <Button
                onClick={promptForNotificationPermission}
                variant="outline"
                className="w-full"
              >
                <Bell className="w-4 h-4 mr-2" />
                {t('settings.pushNotifications')}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <Label>{t('settings.alarms')}</Label>
                  <p className="text-sm text-muted-foreground">{t('settings.alarmsDesc')}</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.alarms}
                onCheckedChange={() => handleToggleNotification('alarms')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-primary" />
                <div>
                  <Label>{t('settings.bedtimeReminder')}</Label>
                  <p className="text-sm text-muted-foreground">{t('settings.bedtimeReminderDesc')}</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.bedtimeReminder}
                onCheckedChange={() => handleToggleNotification('bedtimeReminder')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <Label>{t('settings.weeklyReport')}</Label>
                  <p className="text-sm text-muted-foreground">{t('settings.weeklyReportDesc')}</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications.weeklyReport}
                onCheckedChange={() => handleToggleNotification('weeklyReport')}
              />
            </div>
          </div>
        </Card>

        {/* Data & Privacy */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.dataPrivacy')}</h2>

          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 justify-start"
                onClick={handleExportJSON}
              >
                <Download className="w-5 h-5 mr-3" />
                {t('settings.exportJSON')}
              </Button>

              <Button
                variant="outline"
                className="flex-1 justify-start"
                onClick={handleExportCSV}
              >
                <FileText className="w-5 h-5 mr-3" />
                {t('settings.exportCSV')}
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleImportClick}
            >
              <Upload className="w-5 h-5 mr-3" />
              {t('settings.importData')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleClearData}
            >
              <Trash2 className="w-5 h-5 mr-3" />
              {t('settings.clearAllData')}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
            >
              <Shield className="w-5 h-5 mr-3" />
              {t('settings.privacyPolicy')}
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('settings.about')}</h2>
          <div className="space-y-2 text-sm text-muted-foreground whitespace-pre-line">
            {t('settings.aboutDesc')}
          </div>
        </Card>

        {/* Clear Data Confirmation Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your
                sleep data, alarms, notes, and settings from this device.
                <br /><br />
                <strong>Consider exporting your data first!</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmClearData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Settings;
