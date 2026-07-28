import { useState, type ReactNode } from 'react';
import { Icon } from '../components/Icon';
import { screenStyle, bodyStyle, Header } from './screenChrome';

// ─── Menu tab ────────────────────────────────────────────────────────────────
//
// Figma: "Menu" (node 497-13232) - the signed-in, signed-in-without-a-name, and
// guest variants. Layout is a stack of labelled groups, each an `#1b1b1c` card
// of list rows, closed by the version footer.
//
// Rows that carry a value (Appearance, Language) open a bottom-sheet picker;
// Haptic feedback is an inline toggle; the rest are chevron rows.

const PAGE = 16;

// Figma dark-theme tokens (Surface/surfaceSecondary, Text/text*, Alerts/error,
// Disabled/disabled) - the same set the Historical price card uses.
const SURFACE = '#1b1b1c';
const PAGE_BG = '#101111';
const BORDER = '#444547';
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#f4f5f7';
const DANGER = '#dc8589';
const TOGGLE_TRACK_OFF = '#9a979b';
const TOGGLE_TRACK_ON = '#f6f6f6';
const TOGGLE_THUMB = '#252526';

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
  bottomBar,
}: MenuScreenProps) {
  const [appearance, setAppearance] = useState('Dark');
  const [language, setLanguage] = useState('English');
  const [haptics, setHaptics] = useState(false);
  // Which bottom sheet is up: an option picker, or the delete confirmation.
  const [sheet, setSheet] = useState<'appearance' | 'language' | 'delete' | null>(null);

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

          <Group label="Preferences">
            <Row
              icon="sun"
              label="Appearance"
              value={appearance}
              onClick={() => setSheet('appearance')}
            />
            <Row icon="globe" label="Language" value={language} onClick={() => setSheet('language')} />
            <ToggleRow
              icon="mobile"
              label="Haptic feedback"
              on={haptics}
              onChange={() => setHaptics((h) => !h)}
            />
          </Group>

          <Group label="Support & Legal">
            <Row icon="bank" label="Legal" onClick={() => onNotice('Legal documents open here')} />
            <Row
              icon="chat-dots"
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
      {sheet === 'delete' && (
        <ConfirmSheet
          title="Delete account?"
          body="This removes your profile, saved pieces, and everything the concierge has learned about you. It cannot be undone."
          confirmLabel="Delete account"
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
      <span
        style={{
          position: 'relative',
          width: 52,
          height: 32,
          flexShrink: 0,
          borderRadius: 100,
          background: on ? TOGGLE_TRACK_ON : TOGGLE_TRACK_OFF,
          transition: 'background 200ms cubic-bezier(0.25,0.1,0.25,1)',
        }}
        aria-hidden
      >
        <span
          style={{
            position: 'absolute',
            top: 4,
            left: on ? 24 : 4,
            width: 24,
            height: 24,
            borderRadius: 100,
            background: TOGGLE_THUMB,
            transition: 'left 200ms cubic-bezier(0.25,0.1,0.25,1)',
          }}
        />
      </span>
    </button>
  );
}

// ─── Bottom sheets ───────────────────────────────────────────────────────────
//
// Same shell as the onboarding pickers (KidsScreen -> AgePickerSheet): dimmed
// backdrop, `#0d0d0d` sheet with a 20px top radius, centered title + close.

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 300,
          background: 'rgba(0,0,0,0.75)',
          animation: 'backdropFadeIn 200ms ease both',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 301,
          background: '#0d0d0d',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          animation: 'sheetSlideUp 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
          paddingBottom: `calc(20px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 20px 4px',
          }}
        >
          <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, lineHeight: '24px' }}>{title}</p>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              right: 20,
              top: 18,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#2a2a2a',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 4L14 14M14 4L4 14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

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

function ConfirmSheet({
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Sheet title={title} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '12px 20px 0' }}>
        <p style={{ margin: 0, fontSize: 15, lineHeight: '22px', color: '#999', textAlign: 'center' }}>{body}</p>
        <button
          onClick={onConfirm}
          style={{
            width: '100%',
            height: 48,
            background: DANGER,
            color: '#2b0d0f',
            border: 'none',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {confirmLabel}
        </button>
        <button
          onClick={onClose}
          style={{
            width: '100%',
            height: 48,
            background: 'transparent',
            color: '#f2f2f2',
            border: '1px solid #313131',
            borderRadius: 100,
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          Cancel
        </button>
      </div>
    </Sheet>
  );
}
