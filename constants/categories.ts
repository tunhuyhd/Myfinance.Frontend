import {
  Home, Car, Utensils, ShoppingBag, Coffee, Laptop, Smartphone, 
  Briefcase, GraduationCap, HeartPulse, Plane, Bus, Music, Gamepad2, 
  Gift, Wrench, Zap, Film, Camera, Book, Scissors, PenTool, Tv, Wifi, 
  Baby, Bone, Dumbbell, Umbrella, Droplet, Flame, 
  Wallet, PiggyBank, Landmark, Coins, CreditCard, Banknote, Receipt,
  HelpCircle, BookOpen, MoreHorizontal, TrendingUp, Store, PlusCircle,
  LucideIcon
} from 'lucide-react';

export const CATEGORY_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#64748b', // slate-500
];

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'home': Home,
  'car': Car,
  'utensils': Utensils,
  'shopping-bag': ShoppingBag,
  'coffee': Coffee,
  'laptop': Laptop,
  'smartphone': Smartphone,
  'briefcase': Briefcase,
  'graduation-cap': GraduationCap,
  'heart-pulse': HeartPulse,
  'plane': Plane,
  'bus': Bus,
  'music': Music,
  'gamepad-2': Gamepad2,
  'gift': Gift,
  'wrench': Wrench,
  'zap': Zap,
  'film': Film,
  'camera': Camera,
  'book': Book,
  'book-open': BookOpen,
  'scissors': Scissors,
  'pen-tool': PenTool,
  'tv': Tv,
  'wifi': Wifi,
  'baby': Baby,
  'bone': Bone,
  'dumbbell': Dumbbell,
  'umbrella': Umbrella,
  'droplet': Droplet,
  'flame': Flame,
  'wallet': Wallet,
  'piggy-bank': PiggyBank,
  'landmark': Landmark,
  'coins': Coins,
  'credit-card': CreditCard,
  'banknote': Banknote,
  'receipt': Receipt,
  'more-horizontal': MoreHorizontal,
  'trending-up': TrendingUp,
  'store': Store,
  'plus-circle': PlusCircle,
  'help-circle': HelpCircle
};

export const getCategoryIcon = (iconName: string): LucideIcon => {
  if (!iconName) return HelpCircle;
  return CATEGORY_ICONS[iconName.toLowerCase()] || HelpCircle;
};
