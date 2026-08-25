export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export type DayOfWeek = (typeof DAYS)[number];

export interface TimeSlotDef {
  index: number;
  start: string;
  end: string;
  slotString: string;
  display: string;
}

export const TIME_SLOTS: TimeSlotDef[] = [
  {
    index: 0,
    start: "08:00",
    end: "09:30",
    slotString: "08:00-09:30",
    display: "08:00 AM – 09:30 AM",
  },
  {
    index: 1,
    start: "09:30",
    end: "11:00",
    slotString: "09:30-11:00",
    display: "09:30 AM – 11:00 AM",
  },
  {
    index: 2,
    start: "11:00",
    end: "12:30",
    slotString: "11:00-12:30",
    display: "11:00 AM – 12:30 PM",
  },
  {
    index: 3,
    start: "13:30",
    end: "15:00",
    slotString: "13:30-15:00",
    display: "01:30 PM – 03:00 PM",
  },
  {
    index: 4,
    start: "15:00",
    end: "16:30",
    slotString: "15:00-16:30",
    display: "03:00 PM – 04:30 PM",
  },
];

/**
 * Normalizes any slot format (e.g., "08:00 - 09:30", "08:00-09:30", {start: "08:00", end: "09:30"})
 * to the canonical format "08:00-09:30".
 */
export function normalizeSlotString(
  slot: string | { start?: string; end?: string; slotIndex?: number } | null | undefined
): string {
  if (!slot) return "";
  if (typeof slot === "object") {
    if (slot.start && slot.end) {
      return `${slot.start.trim()}-${slot.end.trim()}`;
    }
    if (typeof slot.slotIndex === "number" && TIME_SLOTS[slot.slotIndex]) {
      return TIME_SLOTS[slot.slotIndex].slotString;
    }
  }
  return String(slot).replace(/\s+/g, "").toLowerCase();
}
