type AnalyticsProps = Record<string, unknown>;

type AnalyticsEvent = {
  name: string;
  properties?: AnalyticsProps;
  timestamp: string;
};

const MAX_MEMORY_EVENTS = 200;
const memoryEvents: AnalyticsEvent[] = [];
let distinctId: string | null = null;
let person: AnalyticsProps = {};

function pushEvent(name: string, properties?: AnalyticsProps) {
  const event: AnalyticsEvent = {
    name,
    properties: {
      ...person,
      ...properties,
      distinct_id: distinctId,
    },
    timestamp: new Date().toISOString(),
  };
  memoryEvents.unshift(event);
  if (memoryEvents.length > MAX_MEMORY_EVENTS) {
    memoryEvents.pop();
  }

  if (__DEV__) {
    console.debug('[analytics]', name, event.properties);
  }

  void persistEvent(event);
}

async function persistEvent(event: AnalyticsEvent) {
  try {
    const { isSupabaseConfigured, supabase } = await import('./supabase');
    if (!isSupabaseConfigured) return;
    const { data } = await supabase.auth.getUser();
    await supabase.from('analytics_events').insert({
      user_id: data.user?.id ?? null,
      event_name: event.name,
      properties: event.properties ?? {},
    });
  } catch {
    // Analytics must never break product flows.
  }
}

export const analytics = {
  capture(name: string, properties?: AnalyticsProps) {
    pushEvent(name, properties);
  },
  identify(id: string, properties?: AnalyticsProps) {
    distinctId = id;
    person = { ...person, ...properties };
    pushEvent('identify', { distinct_id: id, ...properties });
  },
  reset() {
    distinctId = null;
    person = {};
    pushEvent('reset');
  },
  screen(name: string, properties?: AnalyticsProps) {
    pushEvent('screen_viewed', { screen: name, ...properties });
  },
  getEvents() {
    return [...memoryEvents];
  },
};

export function useAnalytics() {
  return analytics;
}

/** Drop-in replacement for `usePostHog()` from posthog-react-native. */
export function usePostHog() {
  return analytics;
}

export default analytics;
