import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date in Asia/Karachi timezone
export function formatDate(date?: string | Date | null, format = "DD-MM-YYYY"): string {
  if (!date) return "-";
  try {
    return dayjs(date).tz("Asia/Karachi").format(format);
  } catch {
    return dayjs(date).format(format);
  }
}

// Format Pakistani Rupee / SAR currency
export function formatCurrency(amount?: number | null, currency = "PKR"): string {
  if (amount === undefined || amount === null) return `0 ${currency}`;
  return `${amount.toLocaleString("en-PK")} ${currency}`;
}

export function getInitials(name?: string | null): string {
  if (!name) return "TA";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
