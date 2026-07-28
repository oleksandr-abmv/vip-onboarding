import { useState, type ReactNode } from 'react';
import { Icon } from '../components/Icon';
import Dialog from '../components/Dialog';
import Sheet from '../components/Sheet';
import MemorySheet from '../components/MemorySheet';
import Toggle from '../components/Toggle';
import { screenStyle, bodyStyle, Header } from './screenChrome';

// ─── Menu tab ────────────────────────────────────────────────────────────────
//
// Figma: "Menu" (node 497-13232) and "Settings" (node 5380-6999) - the signed-in,
// signed-in-without-a-name, and guest variants. Layout is a stack of labelled
// groups, each an `#1b1b1c` card of list rows, closed by the version footer.
//
// Rows that carry a value (Appearance, Language, Data Memory) open a bottom
// sheet; Haptic feedback is an inline toggle; the rest are chevron rows.

const PAGE = 16;

// Figma dark-theme tokens (Surface/surfaceSecondary, Text/text*, Alerts/error,
// Disabled/disabled) - the same set the Historical price card uses.
const SURFACE = '#1b1b1c';
const PAGE_BG = '#101111';
const BORDER = '#444547';
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#f4f5f7';
const DANGER = '#dc8589';

const APPEARANCES = ['Light', 'Dark', 'System'];
const LANGUAGES = ['English', 'French', 'German', 'Italian', 'Spanish'];

interface MenuScreenProps {
  /** Guest mode swaps the profile card for the "create an account" prompt. */
  isGuest: boolean;
  /** Display name + email for the signed-in card. Name may be null. */
  userName?: string | null;
  userEmail?: string;
  /** Guest CTA and the two Account rows all leave the tab. */
  onCreateAccount: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  /** Toast for rows with no destination yet. */
  onNotice: (message: string) => void;
  /** Data Memory, owned by the feed so the Chat tab writes to the same store. */
  memoryEnabled: boolean;
  onMemoryEnabledChange: (enabled: boolean) => void;
  /** Push the full-screen Manage Memory view. */
  onManageMemory: () => void;
  /** Bottom bar, passed in so the tab bar stays owned by the feed. */
  bottomBar?: ReactNode;
}

export default function MenuScreen({
  isGuest,
  userName = 'Aaron Armstrong',
  userEmail = 'aaronarmstrong@gmail.com',
  onCreateAccount,
  onSignOut,
  onDeleteAccount,
  onNotice,
  memoryEnabled,
  onMemoryEnabledChange,
  onManageMemory,
  bottomBar,
}: MenuScreenProps) {
  const [appearance, setAppearance] = useState('Dark');
  const [language, setLanguage] = useState('English');
  const [haptics, setHaptics] = useState(false);
  // Which sheet is up: an option picker, the Memory sheet, or the delete dialog.
  const [sheet, setSheet] = useState<'appearance' | 'language' | 'memory' | 'delete' | null>(null);

  return (
    <div style={screenStyle}>
      <Header title="Menu" />

      <div style={bodyStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: `12px ${PAGE}px` }}>
          {isGuest ? (
            <GuestCard onCreateAccount={onCreateAccount} />
          ) : (
            <UserCard name={userName} email={userEmail} />
          )}

          <Group label="Personalization">
            <Row
              icon="sun"
              label="Appearance"
              value={appearance}
              onClick={() => setSheet('appearance')}
            />
            <Row icon="globe" label="Language" value={language} onClick={() => setSheet('language')} />
            <Row
              icon="book-open"
              label="Data Memory"
              value={memoryEnabled ? 'On' : 'Off'}
              onClick={() => setSheet('memory')}
            />
            <ToggleRow
              icon="vibration"
              label="Haptic feedback"
              on={haptics}
              onChange={() => setHaptics((h) => !h)}
            />
          </Group>

          <Group label="Support & Legal">
            <Row icon="balance" label="Legal" onClick={() => onNotice('Legal documents open here')} />
            <Row
              icon="feedback"
              label="Share your feedback"
              onClick={() => onNotice('Feedback form opens here')}
            />
            <Row
              icon="help-circle"
              label="Need help? Contact us"
              onClick={() => onNotice('Concierge support opens here')}
            />
          </Group>

          <Group label="Account">
            <Row icon="logout" label="Sign out" onClick={onSignOut} />
            <Row icon="trash" label="Delete account" destructive onClick={() => setSheet('delete')} />
          </Group>

          <p
            style={{
              margin: 0,
              textAlign: 'center',
              fontSize: 12,
              lineHeight: '16px',
              color: TEXT_SECONDARY,
              opacity: 0.6,
            }}
          >
            VIP AI V1.0
          </p>
        </div>
      </div>

      {bottomBar}

      {sheet === 'appearance' && (
        <OptionSheet
          title="Appearance"
          options={APPEARANCES}
          selected={appearance}
          onSelect={(v) => {
            setAppearance(v);
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'language' && (
        <OptionSheet
          title="Language"
          options={LANGUAGES}
          selected={language}
          onSelect={(v) => {
            setLanguage(v);
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'memory' && (
        <MemorySheet
          enabled={memoryEnabled}
          onToggle={() => onMemoryEnabledChange(!memoryEnabled)}
          onManage={() => {
            setSheet(null);
            onManageMemory();
          }}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'delete' && (
        <Dialog
          title="Are you sure you want to delete your account?"
          body="This action is irreversible. Your profile, saved pieces, and everything the concierge has learned about you are removed permanently."
          confirmLabel="Delete my account"
          onConfirm={() => {
            setSheet(null);
            onDeleteAccount();
          }}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}

// ─── Header cards ────────────────────────────────────────────────────────────

/** Initials for the avatar: first letter of the first two words. */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function UserCard({ name, email }: { name: string | null; email: string }) {
  return (
    <div
      style={{
        background: SURFACE,
        borderRadius: 16,
        padding: name ? '16px 12px' : 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {name && (
        <span
          style={{
            width: 52,
            height: 52,
            flexShrink: 0,
            borderRadius: 100,
            background: PAGE_BG,
            border: `1px solid ${BORDER}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 600,
            color: '#fff',
          }}
          aria-hidden
        >
          {initials(name)}
        </span>
      )}
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        {name && (
          <span style={{ fontSize: 16, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: '22px' }}>{name}</span>
        )}
        <span
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: TEXT_SECONDARY,
            lineHeight: '22px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {email}
        </span>
      </span>
    </div>
  );
}

function GuestCard({ onCreateAccount }: { onCreateAccount: () => void }) {
  return (
    <div
      style={{
        background: SURFACE,
        borderRadius: 16,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <p
        style={{
          margin: '4px 0 0',
          fontSize: 16,
          lineHeight: '22px',
          color: TEXT_PRIMARY,
          textAlign: 'center',
        }}
      >
        Some features are limited in guest mode. Please create an account or log in to unlock full access.
      </p>
      <button
        onClick={onCreateAccount}
        style={{
          width: '100%',
          height: 48,
          background: '#f6f6f6',
          color: '#121212',
          border: 'none',
          borderRadius: 100,
          fontSize: 16,
          fontWeight: 500,
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Create an account or log in
      </button>
    </div>
  );
}

// ─── Group + rows ────────────────────────────────────────────────────────────

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 16, fontWeight: 400, color: TEXT_PRIMARY, lineHeight: '22px' }}>{label}</span>
      <div
        style={{
          background: SURFACE,
          borderRadius: 16,
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  all: 'unset',
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '12px 0',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'transparent',
};

function Row({
  icon,
  label,
  value,
  destructive = false,
  onClick,
}: {
  icon: string;
  label: string;
  value?: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  const tint = destructive ? DANGER : TEXT_PRIMARY;
  return (
    <button onClick={onClick} style={rowStyle}>
      <Icon name={icon} size={24} color={tint} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 16, color: tint, lineHeight: '22px' }}>{label}</span>
      {value && (
        <span style={{ fontSize: 12, color: TEXT_SECONDARY, lineHeight: '16px', whiteSpace: 'nowrap' }}>
          {value}
        </span>
      )}
      <Icon name="chevron-right" size={24} color={tint} />
    </button>
  );
}

function ToggleRow({
  icon,
  label,
  on,
  onChange,
}: {
  icon: string;
  label: string;
  on: boolean;
  onChange: () => void;
}) {
  return (
    <button onClick={onChange} role="switch" aria-checked={on} aria-label={label} style={rowStyle}>
      <Icon name={icon} size={24} color={TEXT_PRIMARY} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 16, color: TEXT_PRIMARY, lineHeight: '22px' }}>{label}</span>
      <Toggle on={on} />
    </button>
  );
}


// ─── Option picker sheet (Appearance, Language) ──────────────────────────────

function OptionSheet({
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Sheet title={title} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 20px 0' }}>
        {options.map((o) => {
          const active = o === selected;
          return (
            <button
              key={o}
              onClick={() => onSelect(o)}
              aria-pressed={active}
              style={{
                all: 'unset',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '14px 0',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: '22px',
                color: active ? '#fff' : '#d7d7d7',
                fontWeight: active ? 600 : 400,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span style={{ flex: 1 }}>{o}</span>
              {active && <Icon name="check" size={20} color="#fff" />}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}
