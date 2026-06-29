import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "VND") {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export function formatDate(dateStr: string | Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
  }).format(new Date(dateStr));
}
