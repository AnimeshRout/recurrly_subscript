import { icons, type IconKey } from '@/constants/icons';
import type { ImageSourcePropType } from 'react-native';

export type SubscriptionRow = {
  id: string;
  user_id: string;
  name: string;
  plan: string | null;
  category: string | null;
  payment_method: string | null;
  status: string | null;
  start_date: string | null;
  price: number | string;
  currency: string | null;
  billing: string | null;
  frequency: string | null;
  renewal_date: string | null;
  color: string | null;
  icon_key: string | null;
};

function isIconKey(value: string): value is IconKey {
  return value in icons;
}

export function iconFromKey(key?: string | null): ImageSourcePropType {
  if (key && isIconKey(key)) return icons[key];
  return icons.plus;
}

export function iconKeyFromSource(source: ImageSourcePropType): string {
  const match = (Object.keys(icons) as IconKey[]).find((key) => icons[key] === source);
  return match ?? 'plus';
}

export function mapRowToSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    icon: iconFromKey(row.icon_key),
    iconKey: row.icon_key ?? 'plus',
    name: row.name,
    plan: row.plan ?? undefined,
    category: row.category ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
    status: row.status ?? undefined,
    startDate: row.start_date ?? undefined,
    price: Number(row.price),
    currency: row.currency ?? 'USD',
    billing: row.billing ?? 'Monthly',
    frequency: row.frequency ?? row.billing ?? undefined,
    renewalDate: row.renewal_date ?? undefined,
    color: row.color ?? undefined,
  };
}

export function mapSubscriptionToRow(subscription: Subscription, userId: string) {
  return {
    id: subscription.id,
    user_id: userId,
    name: subscription.name,
    plan: subscription.plan ?? null,
    category: subscription.category ?? null,
    payment_method: subscription.paymentMethod ?? null,
    status: subscription.status ?? 'active',
    start_date: subscription.startDate ?? null,
    price: subscription.price,
    currency: subscription.currency ?? 'USD',
    billing: subscription.billing,
    frequency: subscription.frequency ?? subscription.billing,
    renewal_date: subscription.renewalDate ?? null,
    color: subscription.color ?? null,
    icon_key: subscription.iconKey ?? iconKeyFromSource(subscription.icon),
  };
}
