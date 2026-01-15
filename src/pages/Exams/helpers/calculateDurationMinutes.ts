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
    `${startDate.toISOString().split("T")[0]}T${startTime}`,
    { zone: tz }
  );
  const endLocal = DateTime.fromISO(
    `${endDate.toISOString().split("T")[0]}T${endTime}`,
    { zone: tz }
  );
  const diffMinutes = endLocal.diff(startLocal, "minutes").minutes;
  return diffMinutes > 0 ? Math.floor(diffMinutes) : null;
};

export default calculateDurationMinutes;
