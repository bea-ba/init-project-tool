import { useEffect, useState } from 'react';

/**
 * Hook for screen reader announcements using ARIA live regions
 */
export const useScreenReader = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(''); // Clear first to ensure announcement
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  };

  return { announcement, announce };
};

/**
 * Screen Reader Announcer Component
 * Place once in your app to provide live region announcements
 */
interface ScreenReaderAnnouncerProps {
  announcement: string;
  priority?: 'polite' | 'assertive';
}

export const ScreenReaderAnnouncer = ({
  announcement,
  priority = 'polite'
}: ScreenReaderAnnouncerProps) => {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};
