// Voice-first dashboard (v0.4): current status at top, large primary action
// cards, a persistent voice button, and the emergency control always in reach.

import { PrimaryActionCard, StatusBanner } from '../components/PrimaryActionCard';
import { EmergencyControl, type EmergencyStatus } from '../components/EmergencyControl';
import { PermissionStatusCard } from '../permissions/PermissionStatusCard';
import { VoiceControlButton } from '../voice/VoiceControlButton';
import type { PermissionService } from '../permissions/permissionService';

export type DashboardTab = 'tracking' | 'journey' | 'sos' | 'routes' | 'community' | 'settings';

export function VoiceFirstDashboard({
  permissionService,
  emergency,
  activeJourney,
  offline,
  onOpenTab,
  onOpenPermissions,
  onEmergency,
  onCancelEmergency,
  onResolveEmergency,
  speak,
  installPrompt,
  isInstalled,
  onInstallApp,
}: {
  permissionService: PermissionService;
  emergency: EmergencyStatus;
  activeJourney: { destination: string; status: string } | null;
  offline: boolean;
  onOpenTab: (tab: DashboardTab) => void;
  onOpenPermissions: () => void;
  onEmergency: (payload: { lat?: number; lng?: number; battery?: number }) => void;
  onCancelEmergency: () => void;
  onResolveEmergency: () => void;
  speak: (text: string, priority?: number, dedupeKey?: string) => void;
  installPrompt?: any;
  isInstalled?: boolean;
  onInstallApp?: () => void;
}) {
  return (
    <div className="voice-dashboard">
      <header className="dashboard-head">
        <div>
          <p className="topbar-kicker">watchora · command centre</p>
          <h2 id="dashboard-title" tabIndex={-1}>
            Home
          </h2>
        </div>
        <div className="control-inline">
          <VoiceControlButton />
        </div>
      </header>

      {offline && (
        <StatusBanner tone="warn">
          You are offline. Local hazard detection, saved information, and OCR remain available. Cloud scene descriptions and remote emergency delivery may be unavailable.
        </StatusBanner>
      )}

      {emergency.state === 'active' && (
        <EmergencyControl status={emergency} onTrigger={onEmergency} onCancel={onCancelEmergency} onResolve={onResolveEmergency} speak={speak} />
      )}

      <section className="status-grid">
        <div className="status-card" role="region" aria-label="Watchora status">
          <div className="status-card-head">
            <span className="status-icon" aria-hidden="true">
              {emergency.state === 'active' ? '🚨' : activeJourney ? '🛡️' : '🟢'}
            </span>
            <div>
              <h3>Status</h3>
              <p className="status-line" aria-live="polite">
                {emergency.state === 'active'
                  ? 'Emergency active.'
                  : activeJourney
                    ? `Safe journey to ${activeJourney.destination} (${activeJourney.status}).`
                    : 'Ready.'}
              </p>
            </div>          </div>
        </div>
        <PermissionStatusCard service={permissionService} onOpen={onOpenPermissions} />
      </section>

      {!isInstalled && (
        <section className="mobile-download-banner panel" style={{ marginTop: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '1.8rem' }} aria-hidden="true">📱</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Download Watchora Mobile App</h3>
              <p className="muted-note" style={{ margin: '4px 0 0' }}>Install as a standalone native app on your phone for instant launch and offline vision assistance.</p>
            </div>
          </div>
          {installPrompt ? (
            <button
              className="primary-btn"
              style={{ minHeight: 48, marginTop: 8 }}
              onClick={onInstallApp}
              aria-label="Install Watchora Mobile App on this device"
            >
              <span aria-hidden="true">📲</span> 1-Tap Install on Mobile Phone
            </button>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: 10, fontSize: '0.88rem' }}>
              <p style={{ margin: '0 0 4px' }}><strong>Android:</strong> Open in Chrome, tap <strong>(⋮)</strong> and select <strong>“Install app”</strong> or <strong>“Add to Home screen”</strong>.</p>
              <p style={{ margin: 0 }}><strong>iPhone (iOS):</strong> Open in Safari, tap <strong>Share</strong> (<span aria-hidden="true">⎙</span>), then tap <strong>“Add to Home Screen”</strong>.</p>
            </div>
          )}
        </section>
      )}

      <section className="primary-cards">
        <PrimaryActionCard
          icon="📍"
          title="Assist"
          explanation="Use the camera to understand your surroundings."
          buttonLabel="Start Assist"
          onActivate={() => onOpenTab('tracking')}
          voiceHint="Describe what is ahead"
        />
        <PrimaryActionCard
          icon="🛡️"
          title="Safe Journey"
          explanation="Watchora monitors your trip and asks if you need help."
          buttonLabel={activeJourney ? 'Open active journey' : 'Start Safe Journey'}
          onActivate={() => onOpenTab('journey')}
          voiceHint="Start a safe journey"
          state={activeJourney ? `Active: ${activeJourney.destination}` : 'No active journey'}
          stateTone={activeJourney ? 'ok' : 'neutral'}
        />
        <PrimaryActionCard
          icon="📖"
          title="Read"
          explanation="Point at text and hear it read aloud."
          buttonLabel="Read text"
          onActivate={() => onOpenTab('tracking')}
          voiceHint="Read this"
        />
        <PrimaryActionCard
          icon="🚨"
          title="Emergency"
          explanation="Share your location with trusted contacts."
          buttonLabel="Open emergency"
          onActivate={() => onOpenTab('sos')}
          voiceHint="Emergency"
        />
      </section>

      <section className="secondary-cards">
        <button className="secondary-card" onClick={() => onOpenTab('routes')}>
          🗺️ <strong>Places</strong>
        </button>
        <button className="secondary-card" onClick={() => onOpenTab('sos')}>
          👥 <strong>Contacts</strong>
        </button>
        <button className="secondary-card" onClick={() => onOpenTab('community')}>
          🛡️ <strong>Community</strong>
        </button>
        <button className="secondary-card" onClick={() => onOpenTab('settings')}>
          ⚙️ <strong>Settings</strong>
        </button>
      </section>

      {emergency.state !== 'active' && (
        <section className="emergency-section">
          <EmergencyControl status={emergency} onTrigger={onEmergency} onCancel={onCancelEmergency} onResolve={onResolveEmergency} speak={speak} />
        </section>
      )}
    </div>
  );
}
