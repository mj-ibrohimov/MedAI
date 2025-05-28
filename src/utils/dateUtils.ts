/**
 * Format a timestamp to a readable time string
 * @param timestamp ISO string timestamp
 * @returns formatted time string (e.g., "10:30 AM")
 */
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format a timestamp to a readable date string
 * @param timestamp ISO string timestamp
 * @returns formatted date string (e.g., "Oct 25, 2023")
 */
export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Group dates by relative time (Today, Yesterday, etc.)
 * @param timestamp ISO string timestamp
 * @returns relative date string
 */
export const getRelativeDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
};