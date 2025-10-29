import { storage } from './localStorage';

/**
 * Export all app data to JSON format
 * @returns JSON string with all data
 */
export const exportDataToJSON = (): string => {
  const data = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    sessions: storage.getSleepSessions(),
    alarms: storage.getAlarms(),
    notes: storage.getNotes(),
    settings: storage.getSettings(),
  };

  return JSON.stringify(data, null, 2);
};

/**
 * Export data as downloadable JSON file
 */
export const downloadDataAsJSON = (): void => {
  const jsonString = exportDataToJSON();
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `dreamwell-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Export data as CSV format (sessions only)
 * @returns CSV string with session data
 */
export const exportSessionsToCSV = (): string => {
  const sessions = storage.getSleepSessions();

  if (sessions.length === 0) {
    return 'No data to export';
  }

  // CSV Headers
  const headers = [
    'Date',
    'Start Time',
    'End Time',
    'Duration (hours)',
    'Quality (%)',
    'Deep Sleep (min)',
    'REM Sleep (min)',
    'Light Sleep (min)',
    'Awake (min)',
    'Interruptions',
    'Notes'
  ];

  // CSV Rows
  const rows = sessions.map(session => [
    session.endTime ? new Date(session.endTime).toLocaleDateString() : 'N/A',
    new Date(session.startTime).toLocaleTimeString(),
    session.endTime ? new Date(session.endTime).toLocaleTimeString() : 'N/A',
    (session.duration / 60).toFixed(2),
    session.quality,
    session.phases.deep,
    session.phases.rem,
    session.phases.light,
    session.phases.awake,
    session.interruptions,
    `"${session.notes.replace(/"/g, '""')}"` // Escape quotes in notes
  ]);

  // Combine headers and rows
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csv;
};

/**
 * Download sessions as CSV file
 */
export const downloadSessionsAsCSV = (): void => {
  const csvString = exportSessionsToCSV();
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `dreamwell-sessions-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Import data from JSON file
 * @param jsonString - JSON string to import
 * @returns Success status and message
 */
export const importDataFromJSON = (jsonString: string): { success: boolean; message: string } => {
  try {
    const data = JSON.parse(jsonString);

    // Validate data structure
    if (!data.sessions && !data.alarms && !data.notes && !data.settings) {
      return {
        success: false,
        message: 'Invalid backup file format. Missing required data fields.',
      };
    }

    // Import sessions
    if (data.sessions && Array.isArray(data.sessions)) {
      data.sessions.forEach((session: any) => {
        // Convert date strings back to Date objects
        const sessionWithDates = {
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : null,
        };
        storage.saveSleepSession(sessionWithDates);
      });
    }

    // Import alarms
    if (data.alarms && Array.isArray(data.alarms)) {
      data.alarms.forEach((alarm: any) => {
        storage.saveAlarm(alarm);
      });
    }

    // Import notes
    if (data.notes && Array.isArray(data.notes)) {
      data.notes.forEach((note: any) => {
        const noteWithDate = {
          ...note,
          date: new Date(note.date),
        };
        storage.saveNote(noteWithDate);
      });
    }

    // Import settings (but preserve current theme preference)
    if (data.settings) {
      const currentSettings = storage.getSettings();
      const settingsWithDate = {
        ...data.settings,
        dataBackup: data.settings.dataBackup ? new Date(data.settings.dataBackup) : null,
        theme: currentSettings.theme, // Preserve current theme
      };
      storage.saveSettings(settingsWithDate);
    }

    return {
      success: true,
      message: `Successfully imported ${data.sessions?.length || 0} sessions, ${data.alarms?.length || 0} alarms, and ${data.notes?.length || 0} notes.`,
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      message: 'Failed to import data. The file may be corrupted or in the wrong format.',
    };
  }
};

/**
 * Handle file upload for import
 * @param file - File object to import
 * @returns Promise with import result
 */
export const handleFileImport = (file: File): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    if (!file.name.endsWith('.json')) {
      resolve({
        success: false,
        message: 'Please select a valid JSON backup file.',
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importDataFromJSON(content);
      resolve(result);
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Failed to read the file. Please try again.',
      });
    };

    reader.readAsText(file);
  });
};
