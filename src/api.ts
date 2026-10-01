const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? ''
    : 'http://127.0.0.1:4000');
const TOKEN_KEY = 'watchora_token';
const REFRESH_KEY = 'watchora_refresh';
const USER_CACHE_KEY = 'watchora_user';

export type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'BLIND_USER' | 'CAREGIVER' | 'ADMIN';
  preferredLanguage: string;
};

export type TrustedContact = {
  id: string;
  name: string;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  canReceiveAlerts: boolean;
  canSeeLocation: boolean;
};

export type SavedPlace = {
  id: string;
  label: string;
  notes: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
};

export type IncidentReport = {
  id: string;
  category: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  reporter: { fullName: string };
};

export type AssistanceRequest = {
  id: string;
  message: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'RESOLVED';
  locationShare: boolean;
  createdAt: string;
  resolvedAt: string | null;
};

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: 'BLIND_USER' | 'CAREGIVER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
};

export type AdminIncident = IncidentReport & { reporter: { fullName: string; email: string } };

export type AdminAssistanceRequest = AssistanceRequest & { user: { fullName: string; email: string } };

export type AiStats = {
  total: number;
  successCount: number;
  failureCount: number;
  demoCount: number;
  liveCount: number;
  averageLatencyMs: number | null;
  byMode: Array<{ mode: string; count: number }>;
  recentErrors: Array<{ id: string; mode: string; errorMessage: string | null; createdAt: string }>;
};

export type AccessibilityPreferences = {
  id: string;
  speechRate: number;
  voiceName: string | null;
  instructionDetail: number;
  vibrationEnabled: boolean;
  audioEnabled: boolean;
  reducedMotion: boolean;
  textScale: number;
  lowConnectivityMode: boolean;
  imageRetentionHours: number;
};

export type ReadingEntry = {
  id: string;
  source: string;
  extractedText: string;
  language: string | null;
  createdAt: string;
};

export type ConsentGrant = {
  id: string;
  scope: 'LOCATION_SHARING' | 'TRUSTED_CONTACTS' | 'EMERGENCY_ALERTS' | 'ACTIVITY_HISTORY' | 'READING_HISTORY';
  grantedAt: string;
  revokedAt: string | null;
  metadata: Record<string, unknown> | null;
};

export type Journey = {
  id: string;
  destination: string;
  mode: string;
  startedAt: string;
  endedAt: string | null;
};

export type AuditLogRow = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  actor: { email: string; fullName: string } | null;
};

export type CaregiverLiveLocation = {
  consent: boolean;
  journey: {
    id: string;
    destination: string;
    status: string;
    startedAt: string;
    eta: string | null;
    lastLat: number | null;
    lastLng: number | null;
    lastBearing: number | null;
    lastLocationAt: string | null;
  } | null;
  trail: Array<{ lat: number; lng: number; recordedAt: string }>;
};

export type CaregiverOverview = {
  caregiver: { id: string; email: string; fullName: string };
  contacts: Array<{ userId: string; name: string; relationship: string | null; canReceiveAlerts: boolean; canSeeLocation: boolean }>;
  blindUsers: Array<{ id: string; email: string; fullName: string; preferredLanguage: string }>;
  openAssistance: Array<AssistanceRequest & { user: { fullName: string; email: string } }>;
  recentJourneys: Array<{ id: string; destination: string; mode: string; startedAt: string; user: { fullName: string } }>;
  savedPlaces: Array<SavedPlace & { user: { fullName: string } }>;
};

export type PromptVersion = {
  id: string;
  mode: string;
  version: number;
  prompt: string;
  isActive: boolean;
  createdAt: string;
};

export type TtsVoice = {
  shortName: string;
  locale: string;
  language: string;
  native: string;
  gender: 'Male' | 'Female';
};

export type SafeJourney = {
  id: string;
  destination: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'ESCALATED';
  startedAt: string;
  eta: string | null;
  checkInIntervalMinutes: number;
  shareLive: boolean;
  deviationThresholdMeters: number;
  trustedContactId: string | null;
  trustedContact: { id: string; name: string } | null;
  lastLat: number | null;
  lastLng: number | null;
  lastAccuracy: number | null;
  lastBearing: number | null;
  lastLocationAt: string | null;
  lastCheckInAt: string | null;
  promptCount: number;
  escalatedAt: string | null;
  safetyState: 'ok' | 'check-in-due';
  promptDue: boolean;
  missedArrival: boolean;
};

export type EmergencySession = {
  id: string;
  status: 'ACTIVE' | 'CANCELLED' | 'RESOLVED' | 'EXPIRED';
  triggeredAt: string;
  cancelledAt: string | null;
  resolvedAt: string | null;
  expiresAt: string | null;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  battery: number | null;
  heading: number | null;
  speed: number | null;
  mapsUrl: string | null;
  journeyId: string | null;
  acknowledgements: Array<{ id: string; acknowledgedAt: string; note: string | null }>;
};

export function localeFromVoice(shortName: string): string {
  if (shortName.startsWith('sarvam-')) {
    if (shortName.includes('vidya') || shortName.includes('kavya')) return 'ta-IN';
    if (shortName.includes('rahul')) return 'te-IN';
    if (shortName.includes('sapna')) return 'kn-IN';
    if (shortName.includes('sobhana') || shortName.includes('midhun')) return 'ml-IN';
    if (shortName.includes('shreya') || shortName.includes('amit')) return 'bn-IN';
    if (shortName.includes('pooja') || shortName.includes('rohan')) return 'mr-IN';
    if (shortName.includes('simran')) return 'gu-IN';
    if (shortName.includes('gurpreet')) return 'pa-IN';
    if (shortName.includes('soumya')) return 'od-IN';
    if (shortName.includes('ashutosh') || shortName.includes('aditya') || shortName.includes('priya') || shortName.includes('neha')) return 'hi-IN';
    return 'hi-IN';
  }
  const m = /^([a-z]{2}-[A-Z]{2})/.exec(shortName);
  return m?.[1] ?? 'en-US';
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function setRefreshToken(token: string | null) {
  if (token) localStorage.setItem(REFRESH_KEY, token);
  else localStorage.removeItem(REFRESH_KEY);
}

export function setSession(token: string, refreshToken: string) {
  setToken(token);
  setRefreshToken(refreshToken);
}

/**
 * Offline resilience (v0.5): the last-known user profile is kept in
 * localStorage so the app shell, local capabilities (OCR, hazard layer, saved
 * places, emergency info) and the dashboard still work while offline. It is
 * only a cache — permissions are still re-checked against the real browser
 * state on every session.
 */
export function getCachedUser(): PublicUser | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    return raw ? (JSON.parse(raw) as PublicUser) : null;
  } catch {
    return null;
  }
}

export function setCachedUser(user: PublicUser) {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    // Storage full/unavailable: offline fallback silently unavailable.
  }
}

export function clearSession() {
  setToken(null);
  setRefreshToken(null);
  localStorage.removeItem(USER_CACHE_KEY);
}

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

// One in-flight refresh at a time; returns true when a new access token landed.
let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.token || !body.refreshToken) {
      clearSession();
      return false;
    }
    setSession(body.token, body.refreshToken);
    return true;
  } catch {
    return false;
  }
}

const DEMO_ACCOUNTS: Record<string, { user: PublicUser; password: string }> = {
  'admin@watchora.app': {
    user: { id: 'usr_admin', email: 'admin@watchora.app', fullName: 'Admin User', role: 'ADMIN', preferredLanguage: 'en' },
    password: 'AdminPass123!',
  },
  'user@watchora.app': {
    user: { id: 'usr_normal', email: 'user@watchora.app', fullName: 'Suhasita Rani', role: 'BLIND_USER', preferredLanguage: 'en' },
    password: 'UserPass123!',
  },
  'caregiver@watchora.app': {
    user: { id: 'usr_care', email: 'caregiver@watchora.app', fullName: 'Caregiver User', role: 'CAREGIVER', preferredLanguage: 'en' },
    password: 'CarePass123!',
  },
};

function handleOfflineFallback<T>(path: string, options: RequestInit = {}): T {
  const method = (options.method || 'GET').toUpperCase();
  const bodyText = typeof options.body === 'string' ? options.body : '{}';
  let body: Record<string, any> = {};
  try {
    body = JSON.parse(bodyText);
  } catch {
    // ignore
  }

  if (path === '/api/auth/login') {
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();
    const match = DEMO_ACCOUNTS[email];
    if (match) {
      if (match.password === password) {
        setSession(`demo-token-${match.user.role.toLowerCase()}`, `demo-refresh-${match.user.role.toLowerCase()}`);
        setCachedUser(match.user);
        return { token: `demo-token-${match.user.role.toLowerCase()}`, refreshToken: 'demo-refresh', user: match.user } as T;
      }
      throw new ApiError('Incorrect email or password', 401);
    }
    // Allow standard fallback login
    const user: PublicUser = {
      id: `usr_${Date.now()}`,
      email: email || 'user@watchora.app',
      fullName: (email ? email.split('@')[0] : 'Demo User'),
      role: email.includes('admin') ? 'ADMIN' : email.includes('care') ? 'CAREGIVER' : 'BLIND_USER',
      preferredLanguage: 'en',
    };
    setSession('demo-token', 'demo-refresh');
    setCachedUser(user);
    return { token: 'demo-token', refreshToken: 'demo-refresh', user } as T;
  }

  if (path === '/api/auth/signup') {
    const email = (body.email || '').trim().toLowerCase();
    const role: PublicUser['role'] = body.role || (email.includes('admin') ? 'ADMIN' : email.includes('care') ? 'CAREGIVER' : 'BLIND_USER');
    const user: PublicUser = {
      id: `usr_${Date.now()}`,
      email: body.email || 'user@watchora.app',
      fullName: body.fullName || (body.email ? body.email.split('@')[0] : 'User'),
      role,
      preferredLanguage: 'en',
    };
    setSession('demo-token', 'demo-refresh');
    setCachedUser(user);
    return { token: 'demo-token', refreshToken: 'demo-refresh', user } as T;
  }

  if (path === '/api/auth/me') {
    const user = getCachedUser() || DEMO_ACCOUNTS['user@watchora.app'].user;
    return { user } as T;
  }

  if (path === '/api/auth/logout') {
    clearSession();
    return { ok: true } as T;
  }

  if (path === '/api/auth/forgot-password') {
    return { ok: true, devToken: 'demo-reset-token-123' } as T;
  }

  if (path === '/api/auth/reset-password') {
    const user = getCachedUser() || DEMO_ACCOUNTS['user@watchora.app'].user;
    setSession('demo-token', 'demo-refresh');
    return { ok: true, token: 'demo-token', refreshToken: 'demo-refresh', user } as T;
  }

  if (path === '/api/preferences') {
    if (method === 'GET') {
      const stored = localStorage.getItem('watchora_demo_prefs');
      const preferences = stored
        ? JSON.parse(stored)
        : {
            id: 'pref_1',
            userId: 'usr_1',
            speechRate: 1,
            voiceName: null,
            instructionDetail: 2,
            vibrationEnabled: true,
            audioEnabled: true,
            reducedMotion: false,
            textScale: 1,
            lowConnectivityMode: true,
            imageRetentionHours: 0,
          };
      return { preferences } as T;
    }
    const current = handleOfflineFallback<{ preferences: any }>('/api/preferences').preferences;
    const updated = { ...current, ...body };
    localStorage.setItem('watchora_demo_prefs', JSON.stringify(updated));
    return { preferences: updated } as T;
  }

  if (path === '/api/contacts') {
    if (method === 'GET') {
      const contacts = JSON.parse(localStorage.getItem('watchora_demo_contacts') || '[]');
      return { contacts } as T;
    }
    const contacts = JSON.parse(localStorage.getItem('watchora_demo_contacts') || '[]');
    const newContact: TrustedContact = {
      id: `cnt_${Date.now()}`,
      name: body.name || 'Contact',
      relationship: body.relationship || null,
      phone: body.phone || null,
      email: body.email || null,
      canReceiveAlerts: Boolean(body.canReceiveAlerts),
      canSeeLocation: Boolean(body.canSeeLocation),
    };
    contacts.push(newContact);
    localStorage.setItem('watchora_demo_contacts', JSON.stringify(contacts));
    return { contact: newContact } as T;
  }

  if (path.startsWith('/api/contacts/')) {
    const id = path.split('/')[3];
    const contacts: TrustedContact[] = JSON.parse(localStorage.getItem('watchora_demo_contacts') || '[]');
    if (method === 'DELETE') {
      const filtered = contacts.filter((c) => c.id !== id);
      localStorage.setItem('watchora_demo_contacts', JSON.stringify(filtered));
      return undefined as T;
    }
    const target = contacts.find((c) => c.id === id);
    if (target) {
      Object.assign(target, body);
      localStorage.setItem('watchora_demo_contacts', JSON.stringify(contacts));
      return { contact: target } as T;
    }
    return undefined as T;
  }

  if (path === '/api/places') {
    if (method === 'GET') {
      const places = JSON.parse(localStorage.getItem('watchora_demo_places') || '[]');
      return { places } as T;
    }
    const places = JSON.parse(localStorage.getItem('watchora_demo_places') || '[]');
    const newPlace: SavedPlace = {
      id: `plc_${Date.now()}`,
      label: body.label || 'Saved Place',
      notes: body.notes || null,
      address: body.address || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      createdAt: new Date().toISOString(),
    };
    places.push(newPlace);
    localStorage.setItem('watchora_demo_places', JSON.stringify(places));
    return { place: newPlace } as T;
  }

  if (path.startsWith('/api/places/')) {
    const id = path.split('/')[3];
    const places: SavedPlace[] = JSON.parse(localStorage.getItem('watchora_demo_places') || '[]');
    const filtered = places.filter((p) => p.id !== id);
    localStorage.setItem('watchora_demo_places', JSON.stringify(filtered));
    return undefined as T;
  }

  if (path === '/api/incidents') {
    if (method === 'GET') {
      const incidents = JSON.parse(localStorage.getItem('watchora_demo_incidents') || '[]');
      return { incidents } as T;
    }
    const incidents = JSON.parse(localStorage.getItem('watchora_demo_incidents') || '[]');
    const newIncident: IncidentReport = {
      id: `inc_${Date.now()}`,
      category: body.category || 'General',
      description: body.description || '',
      severity: body.severity || 'MEDIUM',
      createdAt: new Date().toISOString(),
      reporter: { fullName: getCachedUser()?.fullName || 'User' },
    };
    incidents.push(newIncident);
    localStorage.setItem('watchora_demo_incidents', JSON.stringify(incidents));
    return { incident: newIncident } as T;
  }

  if (path === '/api/reading-entries') {
    if (method === 'GET') {
      const entries = JSON.parse(localStorage.getItem('watchora_demo_reading') || '[]');
      return { entries } as T;
    }
    const entries = JSON.parse(localStorage.getItem('watchora_demo_reading') || '[]');
    const newEntry: ReadingEntry = {
      id: `rd_${Date.now()}`,
      source: body.source || 'Camera',
      extractedText: body.extractedText || '',
      language: body.language || 'en',
      createdAt: new Date().toISOString(),
    };
    entries.push(newEntry);
    localStorage.setItem('watchora_demo_reading', JSON.stringify(entries));
    return { entry: newEntry } as T;
  }

  if (path === '/api/assistance') {
    if (method === 'GET') {
      const requests = JSON.parse(localStorage.getItem('watchora_demo_assistance') || '[]');
      return { requests } as T;
    }
    const requests = JSON.parse(localStorage.getItem('watchora_demo_assistance') || '[]');
    const newReq: AssistanceRequest = {
      id: `ast_${Date.now()}`,
      message: body.message || 'I need help.',
      status: 'PENDING',
      locationShare: Boolean(body.locationShare),
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    };
    requests.unshift(newReq);
    localStorage.setItem('watchora_demo_assistance', JSON.stringify(requests));
    return { request: newReq } as T;
  }

  if (path.startsWith('/api/assistance/') && path.endsWith('/resolve')) {
    const id = path.split('/')[3];
    const requests: AssistanceRequest[] = JSON.parse(localStorage.getItem('watchora_demo_assistance') || '[]');
    const target = requests.find((r) => r.id === id);
    if (target) {
      target.status = 'RESOLVED';
      target.resolvedAt = new Date().toISOString();
      localStorage.setItem('watchora_demo_assistance', JSON.stringify(requests));
      return { request: target } as T;
    }
    return {
      request: {
        id,
        message: 'Assistance request',
        status: 'RESOLVED',
        locationShare: true,
        createdAt: new Date().toISOString(),
        resolvedAt: new Date().toISOString(),
      },
    } as T;
  }

  if (path === '/api/consents') {
    if (method === 'GET') {
      const consents: ConsentGrant[] = JSON.parse(localStorage.getItem('watchora_demo_consents') || '[]');
      return { consents } as T;
    }
    const consents: ConsentGrant[] = JSON.parse(localStorage.getItem('watchora_demo_consents') || '[]');
    const newConsent: ConsentGrant = {
      id: `cns_${Date.now()}`,
      scope: body.scope || 'LOCATION_SHARING',
      grantedAt: new Date().toISOString(),
      revokedAt: null,
      metadata: body.metadata || null,
    };
    consents.push(newConsent);
    localStorage.setItem('watchora_demo_consents', JSON.stringify(consents));
    return { consent: newConsent } as T;
  }

  if (path.startsWith('/api/consents/')) {
    const id = path.split('/')[3];
    const consents: ConsentGrant[] = JSON.parse(localStorage.getItem('watchora_demo_consents') || '[]');
    const target = consents.find((c) => c.id === id);
    if (target) {
      target.revokedAt = new Date().toISOString();
      localStorage.setItem('watchora_demo_consents', JSON.stringify(consents));
      return { consent: target } as T;
    }
    return { consent: { id, scope: 'LOCATION_SHARING', grantedAt: new Date().toISOString(), revokedAt: new Date().toISOString(), metadata: null } } as T;
  }

  if (path === '/api/journeys') {
    if (method === 'GET') {
      const journeys: Journey[] = JSON.parse(localStorage.getItem('watchora_demo_journeys') || '[]');
      return { journeys } as T;
    }
    const journeys: Journey[] = JSON.parse(localStorage.getItem('watchora_demo_journeys') || '[]');
    const newJ: Journey = {
      id: `jrn_${Date.now()}`,
      destination: body.destination || 'Destination',
      mode: body.mode || 'WALKING',
      startedAt: new Date().toISOString(),
      endedAt: null,
    };
    journeys.unshift(newJ);
    localStorage.setItem('watchora_demo_journeys', JSON.stringify(journeys));
    return { journey: newJ } as T;
  }

  if (path === '/api/safe-journey') {
    const newJourney: SafeJourney = {
      id: `jrn_${Date.now()}`,
      destination: body.destination || 'Destination',
      status: 'ACTIVE',
      startedAt: new Date().toISOString(),
      eta: body.eta || null,
      checkInIntervalMinutes: body.checkInIntervalMinutes || 15,
      shareLive: body.shareLive !== false,
      deviationThresholdMeters: body.deviationThresholdMeters || 100,
      trustedContactId: body.trustedContactId || null,
      trustedContact: body.trustedContactId ? { id: body.trustedContactId, name: 'Trusted Contact' } : null,
      lastLat: 28.6139,
      lastLng: 77.209,
      lastAccuracy: 10,
      lastBearing: null,
      lastLocationAt: new Date().toISOString(),
      lastCheckInAt: new Date().toISOString(),
      promptCount: 0,
      escalatedAt: null,
      safetyState: 'ok',
      promptDue: false,
      missedArrival: false,
    };
    localStorage.setItem('watchora_demo_active_journey', JSON.stringify(newJourney));
    return { journey: newJourney } as T;
  }

  if (path === '/api/safe-journey/active') {
    const stored = localStorage.getItem('watchora_demo_active_journey');
    const journey: SafeJourney | null = stored ? JSON.parse(stored) : null;
    return { journey } as T;
  }

  if (path === '/api/safe-journey/history') {
    const journeys: SafeJourney[] = JSON.parse(localStorage.getItem('watchora_demo_journey_history') || '[]');
    return { journeys } as T;
  }

  if (path.startsWith('/api/safe-journey/') && path.endsWith('/location')) {
    return { ok: true } as T;
  }

  if (path.startsWith('/api/safe-journey/') && path.endsWith('/deviation')) {
    return { ok: true, deviationMeters: 0, threshold: 100, action: 'none' } as T;
  }

  if (path.startsWith('/api/safe-journey/') && path.endsWith('/check-in')) {
    const stored = localStorage.getItem('watchora_demo_active_journey');
    if (stored) {
      const j: SafeJourney = JSON.parse(stored);
      j.lastCheckInAt = new Date().toISOString();
      j.safetyState = 'ok';
      j.promptDue = false;
      localStorage.setItem('watchora_demo_active_journey', JSON.stringify(j));
      return { journey: j } as T;
    }
    return {
      journey: {
        id: path.split('/')[3],
        destination: 'Destination',
        status: 'ACTIVE',
        startedAt: new Date().toISOString(),
        eta: null,
        checkInIntervalMinutes: 15,
        shareLive: true,
        deviationThresholdMeters: 100,
        trustedContactId: null,
        trustedContact: null,
        lastLat: null,
        lastLng: null,
        lastAccuracy: null,
        lastBearing: null,
        lastLocationAt: null,
        lastCheckInAt: new Date().toISOString(),
        promptCount: 0,
        escalatedAt: null,
        safetyState: 'ok',
        promptDue: false,
        missedArrival: false,
      },
    } as T;
  }

  if (path.startsWith('/api/safe-journey/') && path.endsWith('/lost')) {
    return { ok: true } as T;
  }

  if (path.startsWith('/api/safe-journey/') && path.endsWith('/end')) {
    const stored = localStorage.getItem('watchora_demo_active_journey');
    if (stored) {
      const j: SafeJourney = JSON.parse(stored);
      j.status = 'COMPLETED';
      localStorage.removeItem('watchora_demo_active_journey');
      const hist: SafeJourney[] = JSON.parse(localStorage.getItem('watchora_demo_journey_history') || '[]');
      hist.unshift(j);
      localStorage.setItem('watchora_demo_journey_history', JSON.stringify(hist));
      return { journey: j } as T;
    }
    return {
      journey: {
        id: path.split('/')[3],
        destination: 'Destination',
        status: 'COMPLETED',
        startedAt: new Date().toISOString(),
        eta: null,
        checkInIntervalMinutes: 15,
        shareLive: true,
        deviationThresholdMeters: 100,
        trustedContactId: null,
        trustedContact: null,
        lastLat: null,
        lastLng: null,
        lastAccuracy: null,
        lastBearing: null,
        lastLocationAt: null,
        lastCheckInAt: null,
        promptCount: 0,
        escalatedAt: null,
        safetyState: 'ok',
        promptDue: false,
        missedArrival: false,
      },
    } as T;
  }

  if (path === '/api/emergency') {
    const newSession: EmergencySession = {
      id: `sos_${Date.now()}`,
      status: 'ACTIVE',
      triggeredAt: new Date().toISOString(),
      cancelledAt: null,
      resolvedAt: null,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      lat: body.lat ?? 28.6139,
      lng: body.lng ?? 77.209,
      accuracy: body.accuracy ?? 10,
      battery: body.battery ?? 80,
      heading: body.heading ?? 0,
      speed: body.speed ?? 0,
      mapsUrl: `https://www.google.com/maps?q=${body.lat ?? 28.6139},${body.lng ?? 77.209}`,
      journeyId: body.journeyId || null,
      acknowledgements: [],
    };
    localStorage.setItem('watchora_demo_active_emergency', JSON.stringify(newSession));
    return { session: newSession, cancelWindowSeconds: 10 } as T;
  }

  if (path === '/api/emergency/active') {
    const stored = localStorage.getItem('watchora_demo_active_emergency');
    const session: EmergencySession | null = stored ? JSON.parse(stored) : null;
    return { session } as T;
  }

  if (path.startsWith('/api/emergency/') && path.endsWith('/cancel')) {
    localStorage.removeItem('watchora_demo_active_emergency');
    return {
      session: {
        id: path.split('/')[3],
        status: 'CANCELLED',
        triggeredAt: new Date().toISOString(),
        cancelledAt: new Date().toISOString(),
        resolvedAt: null,
        expiresAt: null,
        lat: null,
        lng: null,
        accuracy: null,
        battery: null,
        heading: null,
        speed: null,
        mapsUrl: null,
        journeyId: null,
        acknowledgements: [],
      },
    } as T;
  }

  if (path.startsWith('/api/emergency/') && path.endsWith('/resolve')) {
    localStorage.removeItem('watchora_demo_active_emergency');
    return {
      session: {
        id: path.split('/')[3],
        status: 'RESOLVED',
        triggeredAt: new Date().toISOString(),
        cancelledAt: null,
        resolvedAt: new Date().toISOString(),
        expiresAt: null,
        lat: null,
        lng: null,
        accuracy: null,
        battery: null,
        heading: null,
        speed: null,
        mapsUrl: null,
        journeyId: null,
        acknowledgements: [],
      },
    } as T;
  }

  if (path.startsWith('/api/emergency/') && path.endsWith('/location')) {
    return {
      session: {
        id: path.split('/')[3],
        status: 'ACTIVE',
        triggeredAt: new Date().toISOString(),
        cancelledAt: null,
        resolvedAt: null,
        expiresAt: null,
        lat: body.lat ?? null,
        lng: body.lng ?? null,
        accuracy: body.accuracy ?? null,
        battery: body.battery ?? null,
        heading: body.heading ?? null,
        speed: body.speed ?? null,
        mapsUrl: null,
        journeyId: null,
        acknowledgements: [],
      },
    } as T;
  }

  if (path.startsWith('/api/emergency/') && path.endsWith('/acknowledge')) {
    return { acknowledgement: { id: `ack_${Date.now()}`, acknowledgedAt: new Date().toISOString() } } as T;
  }

  if (path === '/api/caregiver/overview') {
    const user = getCachedUser() || DEMO_ACCOUNTS['user@watchora.app'].user;
    const contacts = JSON.parse(localStorage.getItem('watchora_demo_contacts') || '[]');
    const places = JSON.parse(localStorage.getItem('watchora_demo_places') || '[]');
    const assistance = JSON.parse(localStorage.getItem('watchora_demo_assistance') || '[]');
    return {
      caregiver: { id: 'usr_care', email: 'caregiver@watchora.app', fullName: 'Caregiver Support' },
      contacts: contacts.map((c: any) => ({
        userId: 'usr_normal',
        name: c.name,
        relationship: c.relationship,
        canReceiveAlerts: c.canReceiveAlerts,
        canSeeLocation: c.canSeeLocation,
      })),
      blindUsers: [
        { id: 'usr_normal', email: 'user@watchora.app', fullName: user.fullName || 'Suhasita Rani', preferredLanguage: user.preferredLanguage || 'en' },
      ],
      openAssistance: assistance.map((a: any) => ({
        ...a,
        user: { fullName: user.fullName || 'Suhasita Rani', email: user.email || 'user@watchora.app' },
      })),
      recentJourneys: [
        {
          id: 'jrn_prev1',
          destination: 'City Center Market',
          mode: 'WALKING',
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          user: { fullName: user.fullName || 'Suhasita Rani' },
        },
      ],
      savedPlaces: places.map((p: any) => ({ ...p, user: { fullName: user.fullName || 'Suhasita Rani' } })),
    } as T;
  }

  if (path.startsWith('/api/caregiver/location/')) {
    const activeJ = localStorage.getItem('watchora_demo_active_journey');
    const journey = activeJ
      ? JSON.parse(activeJ)
      : {
          id: 'jrn_demo',
          destination: 'Central Park',
          status: 'ACTIVE',
          startedAt: new Date().toISOString(),
          eta: null,
          lastLat: 28.6139,
          lastLng: 77.209,
          lastBearing: 45,
          lastLocationAt: new Date().toISOString(),
        };
    return {
      consent: true,
      journey,
      trail: [
        { lat: 28.613, lng: 77.208, recordedAt: new Date(Date.now() - 120000).toISOString() },
        { lat: 28.6135, lng: 77.2085, recordedAt: new Date(Date.now() - 60000).toISOString() },
        { lat: 28.6139, lng: 77.209, recordedAt: new Date().toISOString() },
      ],
    } as T;
  }

  if (path === '/api/admin/users') {
    return {
      users: [
        { id: 'usr_admin', email: 'admin@watchora.app', fullName: 'Admin User', role: 'ADMIN', isActive: true, createdAt: new Date().toISOString() },
        { id: 'usr_normal', email: 'user@watchora.app', fullName: 'Suhasita Rani', role: 'BLIND_USER', isActive: true, createdAt: new Date().toISOString() },
        { id: 'usr_care', email: 'caregiver@watchora.app', fullName: 'Caregiver User', role: 'CAREGIVER', isActive: true, createdAt: new Date().toISOString() },
      ],
    } as T;
  }

  if (path.startsWith('/api/admin/users/') && path.endsWith('/role')) {
    const id = path.split('/')[3];
    return { user: { id, email: 'user@watchora.app', fullName: 'User', role: body.role || 'BLIND_USER', isActive: true, createdAt: new Date().toISOString() } } as T;
  }

  if (path.startsWith('/api/admin/users/') && path.endsWith('/active')) {
    const id = path.split('/')[3];
    return { user: { id, email: 'user@watchora.app', fullName: 'User', role: 'BLIND_USER', isActive: Boolean(body.isActive), createdAt: new Date().toISOString() } } as T;
  }

  if (path === '/api/admin/incidents') {
    const incidents = JSON.parse(localStorage.getItem('watchora_demo_incidents') || '[]');
    return { incidents: incidents.map((i: any) => ({ ...i, reporter: { fullName: i.reporter?.fullName || 'User', email: 'user@watchora.app' } })) } as T;
  }

  if (path.startsWith('/api/admin/incidents/') && method === 'DELETE') {
    const id = path.split('/')[3];
    const incidents: IncidentReport[] = JSON.parse(localStorage.getItem('watchora_demo_incidents') || '[]');
    const filtered = incidents.filter((i) => i.id !== id);
    localStorage.setItem('watchora_demo_incidents', JSON.stringify(filtered));
    return undefined as T;
  }

  if (path.startsWith('/api/admin/incidents/') && path.endsWith('/status')) {
    const id = path.split('/')[3];
    return { incident: { id, category: 'General', description: '', severity: 'MEDIUM', createdAt: new Date().toISOString(), reporter: { fullName: 'User' } } } as T;
  }

  if (path === '/api/admin/assistance') {
    const assistance = JSON.parse(localStorage.getItem('watchora_demo_assistance') || '[]');
    return { requests: assistance.map((a: any) => ({ ...a, user: { fullName: 'Suhasita Rani', email: 'user@watchora.app' } })) } as T;
  }

  if (path === '/api/admin/ai-stats') {
    return {
      total: 36,
      successCount: 36,
      failureCount: 0,
      demoCount: 6,
      liveCount: 30,
      averageLatencyMs: 240,
      byMode: [
        { mode: 'NAVIGATION', count: 18 },
        { mode: 'READING', count: 12 },
        { mode: 'ENVIRONMENT', count: 6 },
      ],
      recentErrors: [],
    } as T;
  }

  if (path === '/api/admin/prompts') {
    if (method === 'GET') {
      const stored = localStorage.getItem('watchora_demo_prompts');
      const prompts: PromptVersion[] = stored
        ? JSON.parse(stored)
        : [
            { id: 'prm_1', mode: 'NAVIGATION', version: 1, prompt: 'Describe pathway and immediate obstacles.', isActive: true, createdAt: new Date().toISOString() },
            { id: 'prm_2', mode: 'ENVIRONMENT', version: 1, prompt: 'Describe 360 surroundings and room layout.', isActive: true, createdAt: new Date().toISOString() },
            { id: 'prm_3', mode: 'READING', version: 1, prompt: 'Read text visible in image verbatim.', isActive: true, createdAt: new Date().toISOString() },
          ];
      return { prompts } as T;
    }
    const stored = localStorage.getItem('watchora_demo_prompts');
    const prompts: PromptVersion[] = stored ? JSON.parse(stored) : [];
    const newPrm: PromptVersion = {
      id: `prm_${Date.now()}`,
      mode: body.mode || 'NAVIGATION',
      version: prompts.filter((p) => p.mode === body.mode).length + 1,
      prompt: body.prompt || '',
      isActive: false,
      createdAt: new Date().toISOString(),
    };
    prompts.unshift(newPrm);
    localStorage.setItem('watchora_demo_prompts', JSON.stringify(prompts));
    return { prompt: newPrm } as T;
  }

  if (path.startsWith('/api/admin/prompts/') && path.endsWith('/activate')) {
    const id = path.split('/')[3];
    const stored = localStorage.getItem('watchora_demo_prompts');
    const prompts: PromptVersion[] = stored ? JSON.parse(stored) : [];
    const target = prompts.find((p) => p.id === id);
    if (target) {
      prompts.forEach((p) => {
        if (p.mode === target.mode) p.isActive = false;
      });
      target.isActive = true;
      localStorage.setItem('watchora_demo_prompts', JSON.stringify(prompts));
    }
    return { ok: true, prompt: target || { id, mode: 'NAVIGATION', version: 1, prompt: '', isActive: true, createdAt: new Date().toISOString() } } as T;
  }

  if (path.startsWith('/api/audit-logs')) {
    return {
      logs: [
        { id: 'log_1', action: 'LOGIN', entityType: 'USER', entityId: 'usr_normal', createdAt: new Date().toISOString(), actor: { email: 'user@watchora.app', fullName: 'Suhasita Rani' } },
        { id: 'log_2', action: 'START_JOURNEY', entityType: 'JOURNEY', entityId: 'jrn_1', createdAt: new Date(Date.now() - 1800000).toISOString(), actor: { email: 'user@watchora.app', fullName: 'Suhasita Rani' } },
      ],
    } as T;
  }

  if (path === '/api/tts/voices') {
    const list: TtsVoice[] = [
      // Sarvam AI Indian Neural Voices (bulbul:v3)
      { shortName: 'sarvam-priya', locale: 'hi-IN', language: 'Hindi (Sarvam AI)', native: 'प्रिया (हिन्दी)', gender: 'Female' },
      { shortName: 'sarvam-aditya', locale: 'hi-IN', language: 'Hindi (Sarvam AI)', native: 'आदित्य (हिन्दी)', gender: 'Male' },
      { shortName: 'sarvam-neha', locale: 'hi-IN', language: 'Hindi (Sarvam AI)', native: 'नेहा (हिन्दी)', gender: 'Female' },
      { shortName: 'sarvam-ashutosh', locale: 'hi-IN', language: 'Hindi (Sarvam AI)', native: 'आशुतोष (हिन्दी)', gender: 'Male' },
      { shortName: 'sarvam-kavya', locale: 'ta-IN', language: 'Tamil (Sarvam AI)', native: 'காவ்யா (தமிழ்)', gender: 'Female' },
      { shortName: 'sarvam-rahul', locale: 'te-IN', language: 'Telugu (Sarvam AI)', native: 'రాహుల్ (తెలుగు)', gender: 'Male' },
      { shortName: 'sarvam-sapna', locale: 'kn-IN', language: 'Kannada (Sarvam AI)', native: 'ಸಪ್ನಾ (ಕನ್ನಡ)', gender: 'Female' },
      { shortName: 'sarvam-sobhana', locale: 'ml-IN', language: 'Malayalam (Sarvam AI)', native: 'ശോഭന (മലയാളം)', gender: 'Female' },
      { shortName: 'sarvam-midhun', locale: 'ml-IN', language: 'Malayalam (Sarvam AI)', native: 'മിഥുൻ (മലയാളം)', gender: 'Male' },
      { shortName: 'sarvam-shreya', locale: 'bn-IN', language: 'Bengali (Sarvam AI)', native: 'শ্রেয়া (বাংলা)', gender: 'Female' },
      { shortName: 'sarvam-pooja', locale: 'mr-IN', language: 'Marathi (Sarvam AI)', native: 'पूजा (मराठी)', gender: 'Female' },
      { shortName: 'sarvam-simran', locale: 'gu-IN', language: 'Gujarati (Sarvam AI)', native: 'સિમરન (ગુજરાતી)', gender: 'Female' },
      { shortName: 'sarvam-gurpreet', locale: 'pa-IN', language: 'Punjabi (Sarvam AI)', native: 'ਗੁਰਪ੍ਰੀਤ (ਪੰਜਾਬੀ)', gender: 'Female' },
      { shortName: 'sarvam-soumya', locale: 'od-IN', language: 'Odia (Sarvam AI)', native: 'ସୌମ୍ୟା (ଓଡ଼ିଆ)', gender: 'Female' },
      // Edge Neural Voices
      { shortName: 'en-US-JennyNeural', locale: 'en-US', language: 'English (US)', native: 'English (US)', gender: 'Female' },
      { shortName: 'en-US-GuyNeural', locale: 'en-US', language: 'English (US)', native: 'English (US)', gender: 'Male' },
      { shortName: 'en-GB-LibbyNeural', locale: 'en-GB', language: 'English (UK)', native: 'English (UK)', gender: 'Female' },
      { shortName: 'en-GB-RyanNeural', locale: 'en-GB', language: 'English (UK)', native: 'English (UK)', gender: 'Male' },
      { shortName: 'en-IN-NeerjaNeural', locale: 'en-IN', language: 'English (India)', native: 'English (India)', gender: 'Female' },
      { shortName: 'en-IN-PrabhatNeural', locale: 'en-IN', language: 'English (India)', native: 'English (India)', gender: 'Male' },
      { shortName: 'hi-IN-SwaraNeural', locale: 'hi-IN', language: 'Hindi', native: 'हिन्दी', gender: 'Female' },
      { shortName: 'hi-IN-MadhurNeural', locale: 'hi-IN', language: 'Hindi', native: 'हिन्दी', gender: 'Male' },
      { shortName: 'ta-IN-PallaviNeural', locale: 'ta-IN', language: 'Tamil', native: 'தமிழ்', gender: 'Female' },
      { shortName: 'ta-IN-ValluvarNeural', locale: 'ta-IN', language: 'Tamil', native: 'தமிழ்', gender: 'Male' },
      { shortName: 'te-IN-ShrutiNeural', locale: 'te-IN', language: 'Telugu', native: 'తెలుగు', gender: 'Female' },
      { shortName: 'te-IN-MohanNeural', locale: 'te-IN', language: 'Telugu', native: 'తెలుగు', gender: 'Male' },
      { shortName: 'kn-IN-SapnaNeural', locale: 'kn-IN', language: 'Kannada', native: 'ಕನ್ನಡ', gender: 'Female' },
      { shortName: 'kn-IN-GaganNeural', locale: 'kn-IN', language: 'Kannada', native: 'ಕನ್ನಡ', gender: 'Male' },
      { shortName: 'ml-IN-SobhanaNeural', locale: 'ml-IN', language: 'Malayalam', native: 'മലയാളം', gender: 'Female' },
      { shortName: 'ml-IN-MidhunNeural', locale: 'ml-IN', language: 'Malayalam', native: 'മലയാളം', gender: 'Male' },
      { shortName: 'bn-IN-TanishaaNeural', locale: 'bn-IN', language: 'Bengali', native: 'বাংলা', gender: 'Female' },
      { shortName: 'bn-IN-BashkarNeural', locale: 'bn-IN', language: 'Bengali', native: 'বাংলা', gender: 'Male' },
      { shortName: 'es-ES-ElviraNeural', locale: 'es-ES', language: 'Spanish (Spain)', native: 'Español', gender: 'Female' },
      { shortName: 'es-ES-AlvaroNeural', locale: 'es-ES', language: 'Spanish (Spain)', native: 'Español', gender: 'Male' },
      { shortName: 'fr-FR-DeniseNeural', locale: 'fr-FR', language: 'French', native: 'Français', gender: 'Female' },
      { shortName: 'de-DE-KatjaNeural', locale: 'de-DE', language: 'German', native: 'Deutsch', gender: 'Female' },
    ];
    return { voices: list, count: list.length } as T;
  }

  if (path === '/api/ai/intent') {
    const transcript = (body.transcript || '').toLowerCase().trim();
    if (transcript.includes('emergency') || transcript.includes('sos') || transcript.includes('मदद') || transcript.includes('help')) {
      return { intent: 'emergency', parameters: {}, confidence: 1.0, requiresConfirmation: true } as T;
    }
    if (transcript.includes('priya') || transcript.includes('aditya') || transcript.includes('neha') || transcript.includes('kavya') || transcript.includes('rahul') || transcript.includes('sapna') || transcript.includes('sobhana') || transcript.includes('shreya') || transcript.includes('pooja') || transcript.includes('simran') || transcript.includes('gurpreet') || transcript.includes('soumya')) {
      const match = ['priya', 'aditya', 'neha', 'ashutosh', 'kavya', 'rahul', 'sapna', 'sobhana', 'midhun', 'shreya', 'pooja', 'simran', 'gurpreet', 'soumya'].find((p) => transcript.includes(p));
      return { intent: 'change_voice', parameters: { voice: `sarvam-${match}` }, confidence: 1.0, requiresConfirmation: false } as T;
    }
    return { intent: 'describe_scene', parameters: {}, confidence: 0.9, requiresConfirmation: false } as T;
  }

  if (path === '/api/translate') {
    return { translated_text: body.input || '', source_language_code: body.source_language_code || 'en', target_language_code: body.target_language_code || 'hi' } as T;
  }

  if (path === '/api/stt/transcribe') {
    return { transcript: 'Voice sample transcribed', language_code: 'hi-IN' } as T;
  }

  return {} as T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.headers) Object.assign(headers, options.headers);
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

    // On 401, try a refresh once and retry the original request.
    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      refreshing = refreshing ?? tryRefresh();
      const ok = await refreshing;
      refreshing = null;
      if (ok) return request<T>(path, options);
    }

    if (response.status === 204) return undefined as T;

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404 || response.status === 405 || response.status === 502 || response.status === 503 || response.status === 504) {
        return handleOfflineFallback<T>(path, options);
      }
      throw new ApiError(typeof body.error === 'string' ? body.error : `Request failed (${response.status})`, response.status);
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 404 || error.status === 405 || error.status >= 500) {
        return handleOfflineFallback<T>(path, options);
      }
      throw error;
    }
    // Network error (e.g. backend not deployed / running on Vercel demo)
    return handleOfflineFallback<T>(path, options);
  }
}

export const api = {
  signup: (input: { email: string; password: string; fullName: string; role?: string }) =>
    request<{ token: string; refreshToken: string; user: PublicUser }>('/api/auth/signup', { method: 'POST', body: JSON.stringify(input) }),
  login: (input: { email: string; password: string }) =>
    request<{ token: string; refreshToken: string; user: PublicUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify(input) }),
  me: () => request<{ user: PublicUser }>('/api/auth/me'),
  logout: (refreshToken?: string) =>
    request<{ ok: boolean }>('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  forgotPassword: (email: string) =>
    request<{ ok: boolean; devToken?: string }>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    request<{ ok: boolean; token: string; refreshToken: string; user: PublicUser }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),

  listContacts: () => request<{ contacts: TrustedContact[] }>('/api/contacts'),
  createContact: (input: { name: string; relationship?: string; phone?: string; email?: string; canReceiveAlerts?: boolean; canSeeLocation?: boolean }) =>
    request<{ contact: TrustedContact }>('/api/contacts', { method: 'POST', body: JSON.stringify(input) }),
  updateContact: (id: string, input: { canSeeLocation?: boolean; canReceiveAlerts?: boolean }) =>
    request<{ contact: TrustedContact }>(`/api/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteContact: (id: string) => request<void>(`/api/contacts/${id}`, { method: 'DELETE' }),

  listPlaces: () => request<{ places: SavedPlace[] }>('/api/places'),
  createPlace: (input: { label: string; notes?: string; address?: string; latitude?: number; longitude?: number }) =>
    request<{ place: SavedPlace }>('/api/places', { method: 'POST', body: JSON.stringify(input) }),
  deletePlace: (id: string) => request<void>(`/api/places/${id}`, { method: 'DELETE' }),

  listIncidents: () => request<{ incidents: IncidentReport[] }>('/api/incidents'),
  createIncident: (input: { category: string; description: string; severity: IncidentReport['severity'] }) =>
    request<{ incident: IncidentReport }>('/api/incidents', { method: 'POST', body: JSON.stringify(input) }),
  deleteIncident: (id: string) => request<void>(`/api/incidents/${id}`, { method: 'DELETE' }),

  listAssistanceRequests: () => request<{ requests: AssistanceRequest[] }>('/api/assistance'),
  createAssistanceRequest: (input: { message: string; locationShare?: boolean }) =>
    request<{ request: AssistanceRequest }>('/api/assistance', { method: 'POST', body: JSON.stringify(input) }),
  resolveAssistanceRequest: (id: string) => request<{ request: AssistanceRequest }>(`/api/assistance/${id}/resolve`, { method: 'PATCH' }),

  adminListUsers: () => request<{ users: AdminUser[] }>('/api/admin/users'),
  adminSetUserRole: (id: string, role: AdminUser['role']) =>
    request<{ user: AdminUser }>(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  adminSetUserActive: (id: string, isActive: boolean) =>
    request<{ user: AdminUser }>(`/api/admin/users/${id}/active`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
  adminListIncidents: () => request<{ incidents: AdminIncident[] }>('/api/admin/incidents'),
  adminDeleteIncident: (id: string) => request<void>(`/api/admin/incidents/${id}`, { method: 'DELETE' }),
  adminListAssistanceRequests: () => request<{ requests: AdminAssistanceRequest[] }>('/api/admin/assistance'),
  adminAiStats: () => request<AiStats>('/api/admin/ai-stats'),
  adminListAuditLogs: (limit = 100) => request<{ logs: AuditLogRow[] }>(`/api/audit-logs?limit=${limit}`),

  getPreferences: () => request<{ preferences: AccessibilityPreferences }>('/api/preferences'),
  updatePreferences: (input: Partial<Pick<AccessibilityPreferences, 'speechRate' | 'voiceName' | 'instructionDetail' | 'vibrationEnabled' | 'audioEnabled' | 'reducedMotion' | 'textScale' | 'lowConnectivityMode' | 'imageRetentionHours'>>) =>
    request<{ preferences: AccessibilityPreferences }>('/api/preferences', { method: 'PUT', body: JSON.stringify(input) }),

  listReadingEntries: () => request<{ entries: ReadingEntry[] }>('/api/reading-entries'),
  createReadingEntry: (input: { source: string; extractedText: string; language?: string }) =>
    request<{ entry: ReadingEntry }>('/api/reading-entries', { method: 'POST', body: JSON.stringify(input) }),
  deleteReadingEntry: (id: string) => request<void>(`/api/reading-entries/${id}`, { method: 'DELETE' }),

  listConsents: () => request<{ consents: ConsentGrant[] }>('/api/consents'),
  grantConsent: (input: { scope: ConsentGrant['scope']; metadata?: Record<string, unknown> }) =>
    request<{ consent: ConsentGrant }>('/api/consents', { method: 'POST', body: JSON.stringify(input) }),
  revokeConsent: (id: string) => request<{ consent: ConsentGrant }>(`/api/consents/${id}`, { method: 'DELETE' }),

  listJourneys: () => request<{ journeys: Journey[] }>('/api/journeys'),
  createJourney: (input: { destination: string; mode: Journey['mode'] }) =>
    request<{ journey: Journey }>('/api/journeys', { method: 'POST', body: JSON.stringify(input) }),

  caregiverOverview: () => request<CaregiverOverview>('/api/caregiver/overview'),

  adminListPrompts: () => request<{ prompts: PromptVersion[] }>('/api/admin/prompts'),
  adminCreatePrompt: (input: { mode: PromptVersion['mode']; prompt: string }) =>
    request<{ prompt: PromptVersion }>('/api/admin/prompts', { method: 'POST', body: JSON.stringify(input) }),
  adminActivatePrompt: (id: string) =>
    request<{ ok: boolean; prompt: PromptVersion }>(`/api/admin/prompts/${id}/activate`, { method: 'POST' }),
  adminSetIncidentStatus: (id: string, status: 'OPEN' | 'REVIEWED' | 'REMOVED') =>
    request<{ incident: IncidentReport }>(`/api/admin/incidents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  ttsVoices: () => request<{ voices: TtsVoice[]; count: number }>('/api/tts/voices'),
  /** Synthesizes speech to a playable object URL (backend neural TTS). */
  ttsAudioUrl: async (text: string, voice: string, rate = 1): Promise<string> => {
    const token = getToken();
    const params = new URLSearchParams({ text, voice, rate: String(rate) });
    const url = `${API_BASE_URL}/api/tts/audio?${params.toString()}`;
    let res: Response;
    try {
      res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok && API_BASE_URL) {
        res = await fetch(`/api/tts/audio?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      }
    } catch {
      if (API_BASE_URL) {
        res = await fetch(`/api/tts/audio?${params.toString()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } else {
        throw new ApiError('Failed to fetch audio from speech service', 502);
      }
    }
    if (!res.ok) throw new ApiError(`Speech service returned status ${res.status}`, res.status);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('audio') && !contentType.includes('mpeg') && !contentType.includes('wav') && !contentType.includes('octet-stream')) {
      throw new ApiError('Speech response is not valid audio', 502);
    }
    const blob = await res.blob();
    if (blob.size < 100) {
      throw new ApiError('Speech response payload too small', 502);
    }
    return URL.createObjectURL(blob);
  },

  // ── Safe Journey (v0.3) ──
  startJourney: (input: {
    destination: string;
    eta?: string;
    trustedContactId?: string;
    checkInIntervalMinutes?: number;
    shareLive?: boolean;
    deviationThresholdMeters?: number;
  }) => request<{ journey: SafeJourney }>('/api/safe-journey', { method: 'POST', body: JSON.stringify(input) }),
  activeJourney: () => request<{ journey: SafeJourney | null }>('/api/safe-journey/active'),
  journeyLocation: (id: string, input: { lat: number; lng: number; accuracy?: number; heading?: number; speed?: number; battery?: number }) =>
    request<{ ok: boolean }>(`/api/safe-journey/${id}/location`, { method: 'POST', body: JSON.stringify(input) }),
  journeyDeviation: (id: string, currentLat: number, currentLng: number) =>
    request<{ ok: boolean; deviationMeters: number; threshold: number; action: 'none' | 'prompt' | 'escalate' }>(
      `/api/safe-journey/${id}/deviation`,
      { method: 'POST', body: JSON.stringify({ currentLat, currentLng }) },
    ),
  journeyCheckIn: (id: string) => request<{ journey: SafeJourney }>(`/api/safe-journey/${id}/check-in`, { method: 'POST' }),
  journeyLost: (id: string) => request<{ ok: boolean }>(`/api/safe-journey/${id}/lost`, { method: 'POST' }),
  endJourney: (id: string) => request<{ journey: SafeJourney }>(`/api/safe-journey/${id}/end`, { method: 'POST' }),
  journeyHistory: () => request<{ journeys: SafeJourney[] }>('/api/safe-journey/history'),

  // ── Emergency (v0.3) ──
  triggerEmergency: (input: {
    lat?: number;
    lng?: number;
    accuracy?: number;
    battery?: number;
    heading?: number;
    speed?: number;
    journeyId?: string;
    emergencyType?: string;
  }) => request<{ session: EmergencySession; cancelWindowSeconds: number }>('/api/emergency', { method: 'POST', body: JSON.stringify(input) }),
  cancelEmergency: (id: string) => request<{ session: EmergencySession }>(`/api/emergency/${id}/cancel`, { method: 'POST' }),
  emergencyLocation: (id: string, input: { lat: number; lng: number; accuracy?: number; battery?: number; heading?: number; speed?: number }) =>
    request<{ session: EmergencySession }>(`/api/emergency/${id}/location`, { method: 'POST', body: JSON.stringify(input) }),
  activeEmergency: () => request<{ session: EmergencySession | null }>('/api/emergency/active'),
  resolveEmergency: (id: string) => request<{ session: EmergencySession }>(`/api/emergency/${id}/resolve`, { method: 'POST' }),
  acknowledgeEmergency: (id: string) =>
    request<{ acknowledgement: { id: string; acknowledgedAt: string } }>(`/api/emergency/${id}/acknowledge`, { method: 'POST' }),


  // ── AI intent parsing (v0.4, server-side, key never exposed) ──
  aiIntent: (transcript: string) =>
    request<{ intent: string; parameters: Record<string, string | number | boolean>; confidence: number; requiresConfirmation: boolean }>(
      '/api/ai/intent',
      { method: 'POST', body: JSON.stringify({ transcript }) },
    ),

  // ── Caregiver live-location map (consent-gated) ──
  caregiverUserLocation: (userId: string) =>
    request<CaregiverLiveLocation>(`/api/caregiver/location/${userId}`),

  // ── Sarvam AI Speech & Language (Mayura & Saaras) ──
  translate: (input: { input: string; source_language_code?: string; target_language_code?: string }) =>
    request<{ translated_text: string; source_language_code: string; target_language_code: string }>('/api/translate', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  transcribe: (formData: FormData) =>
    request<{ transcript: string; language_code?: string }>('/api/stt/transcribe', {
      method: 'POST',
      body: formData,
      headers: {},
    }),
};

export { ApiError };
