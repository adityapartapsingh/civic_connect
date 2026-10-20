import { formatDistanceToNow, format, parseISO, isPast, differenceInSeconds } from 'date-fns';

/**
 * Calculates distance in meters between two lat/lng coordinates using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Formats distance into human readable text (e.g., "120m away" or "1.4km away")
 */
export function formatDistanceString(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export interface SlaInfo {
  isBreached: boolean;
  hoursLeft: number;
  minutesLeft: number;
  totalSeconds: number;
  formattedText: string;
  badgeColorClass: string;
  urgency: 'critical' | 'warning' | 'normal' | 'breached';
}

/**
 * Returns detailed SLA countdown metrics
 */
export function getSlaInfo(deadlineIso: string, isResolved = false): SlaInfo {
  const deadline = parseISO(deadlineIso);
  const now = new Date();

  if (isResolved) {
    return {
      isBreached: false,
      hoursLeft: 0,
      minutesLeft: 0,
      totalSeconds: 0,
      formattedText: 'Met SLA on time',
      badgeColorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      urgency: 'normal',
    };
  }

  const seconds = differenceInSeconds(deadline, now);
  const isBreached = seconds <= 0 || isPast(deadline);

  if (isBreached) {
    const overdueSeconds = Math.abs(seconds);
    const overdueHours = Math.floor(overdueSeconds / 3600);
    const overdueMinutes = Math.floor((overdueSeconds % 3600) / 60);

    return {
      isBreached: true,
      hoursLeft: -overdueHours,
      minutesLeft: -overdueMinutes,
      totalSeconds: seconds,
      formattedText: `SLA BREACHED (${overdueHours}h ${overdueMinutes}m ago)`,
      badgeColorClass: 'bg-red-700 text-white font-mono border-red-800',
      urgency: 'breached',
    };
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours < 4) {
    return {
      isBreached: false,
      hoursLeft: hours,
      minutesLeft: minutes,
      totalSeconds: seconds,
      formattedText: `${hours}h ${minutes}m left (Urgent)`,
      badgeColorClass: 'bg-red-100 text-red-800 border-red-300',
      urgency: 'critical',
    };
  }

  if (hours < 24) {
    return {
      isBreached: false,
      hoursLeft: hours,
      minutesLeft: minutes,
      totalSeconds: seconds,
      formattedText: `${hours}h ${minutes}m left`,
      badgeColorClass: 'bg-amber-100 text-amber-800 border-amber-300',
      urgency: 'warning',
    };
  }

  return {
    isBreached: false,
    hoursLeft: hours,
    minutesLeft: minutes,
    totalSeconds: seconds,
    formattedText: `${hours}h left`,
    badgeColorClass: 'bg-blue-100 text-blue-800 border-blue-300',
    urgency: 'normal',
  };
}

export function formatRelativeDate(isoDate: string): string {
  try {
    return formatDistanceToNow(parseISO(isoDate), { addSuffix: true });
  } catch {
    return 'recently';
  }
}

export function formatDateTime(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'MMM d, yyyy · h:mm a');
  } catch {
    return isoDate;
  }
}
