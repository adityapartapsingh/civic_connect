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
export function getSlaInfo(deadlineIso?: string | null, isResolved = false): SlaInfo {
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

  if (!deadlineIso) {
    return {
      isBreached: false,
      hoursLeft: 48,
      minutesLeft: 0,
      totalSeconds: 48 * 3600,
      formattedText: '48h SLA Active',
      badgeColorClass: 'bg-slate-100 text-slate-800 border-slate-300',
      urgency: 'normal',
    };
  }

  const deadline = new Date(deadlineIso);
  const now = new Date();

  if (isNaN(deadline.getTime())) {
    return {
      isBreached: false,
      hoursLeft: 48,
      minutesLeft: 0,
      totalSeconds: 48 * 3600,
      formattedText: '48h SLA Active',
      badgeColorClass: 'bg-slate-100 text-slate-800 border-slate-300',
      urgency: 'normal',
    };
  }

  const seconds = Math.floor((deadline.getTime() - now.getTime()) / 1000);
  const isBreached = seconds <= 0;

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

export function formatRelativeDate(isoDate?: string | null): string {
  if (!isoDate) return 'recently';
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return 'recently';
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return 'just now';
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (diffSec < 3600) return rtf.format(-Math.floor(diffSec / 60), 'minute');
    if (diffSec < 86400) return rtf.format(-Math.floor(diffSec / 3600), 'hour');
    if (diffSec < 2592000) return rtf.format(-Math.floor(diffSec / 86400), 'day');
    return rtf.format(-Math.floor(diffSec / 2592000), 'month');
  } catch {
    return 'recently';
  }
}

export function formatDateTime(isoDate?: string | null): string {
  if (!isoDate) return 'N/A';
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return String(isoDate);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  } catch {
    return String(isoDate);
  }
}

/**
 * Accurately determines if the current logged-in user is the original reporter of a report/ticket.
 * Handles user.id, user.user_id, masked phones (e.g. 83******77), raw phones (+918360941177 vs 8360941177).
 */
export function isReportReporter(ticket: any, user: any): boolean {
  if (!ticket || !user) return false;

  const userId = String(user.id || user.user_id || user._id || '').trim();
  const ticketRepId = String(ticket.reporter?.id || ticket.reporter_id || '').trim();
  if (
    userId &&
    ticketRepId &&
    userId !== 'anonymous' &&
    ticketRepId !== 'anonymous' &&
    userId === ticketRepId
  ) {
    return true;
  }

  const userPhone = String(user.phone || '').trim().replace(/\D/g, '');
  const repPhoneRaw = String(ticket.reporter?.phone || ticket.reporter_phone || '').trim();
  const repPhoneMasked = String(ticket.reporter?.phone_masked || '').trim();

  const phoneToCheck = repPhoneRaw || repPhoneMasked;
  if (userPhone && phoneToCheck) {
    // If masked like "83******77" or "••••••1177"
    if (phoneToCheck.includes('*') || phoneToCheck.includes('•')) {
      const cleanDigits = phoneToCheck.replace(/[^\d*•]/g, '');
      const firstTwo = cleanDigits.slice(0, 2);
      const lastTwo = cleanDigits.slice(-2);
      const lastFour = cleanDigits.slice(-4).replace(/\D/g, '');

      if (!firstTwo.includes('*') && !firstTwo.includes('•') && !lastTwo.includes('*') && !lastTwo.includes('•')) {
        if (userPhone.startsWith(firstTwo) && userPhone.endsWith(lastTwo)) {
          return true;
        }
      }
      if (lastFour && lastFour.length >= 2 && userPhone.endsWith(lastFour)) {
        return true;
      }
    } else {
      const repClean = phoneToCheck.replace(/\D/g, '');
      if (repClean && userPhone) {
        if (repClean === userPhone) return true;
        if (userPhone.length >= 10 && repClean.length >= 10 && userPhone.slice(-10) === repClean.slice(-10)) {
          return true;
        }
      }
    }
  }

  return false;
}

