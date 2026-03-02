import { DateTime } from "luxon";

const calculateDurationMinutes = (
  startDate: Date | undefined,
  endDate: Date | undefined,
  startTime: string | undefined,
  endTime: string | undefined
): number | null => {
  if (!startDate || !endDate || !startTime || !endTime) return null;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startLocal = DateTime.fromISO(
    `${DateTime.fromJSDate(startDate).toISODate()}T${startTime}`,
    { zone: tz }
  );
  const endLocal = DateTime.fromISO(
    `${DateTime.fromJSDate(endDate).toISODate()}T${endTime}`,
    { zone: tz }
  );

  const diffMinutes = endLocal.diff(startLocal, "minutes").minutes;
  return diffMinutes > 0 ? Math.floor(diffMinutes) : null;
};

export default calculateDurationMinutes;
