import { useState } from 'react';
import MIcon from '../components/MIcon';
import BottomDock from '../components/BottomDock';
import Dialog from '../components/Dialog';
import ContextualMenu from '../components/ContextualMenu';
import { screenStyle, bodyStyle, Header } from './screenChrome';
import { sheetIconButtonStyle } from '../components/Sheet';
import { theme } from '../theme';
import {
  MEMORY_GROUPS,
  makeFact,
  matchesForget,
  parseMemoryCommand,
  relativeTime,
  type MemoryFact,
} from '../data/memory';

// ─── Manage Data Memory ───────────────────────────────────────────────────────────
//
// Figma: "Settings / Manage Memory" (node 5381-8376), its `more_horiz` menu
// (node 5385-13577) and empty state (node 5381-11305).
//
// Facts are grouped under four headings inside one `radius 16` card; each group
// reads as a paragraph rather than a list of sentences. The header carries a
// `more_horiz` that opens Update Data Memory / Delete all memory.

const SURFACE = '#1b1b1c';
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#f4f5f7';
const TEXT_TERTIARY = '#a9a9ab';

export default function MemoryScreen({
  facts,
  onAdd,
  onForget,
  onClearAll,
  onRefresh,
  onClose,
  onNotice,
}: {
  facts: MemoryFact[];
  onAdd: (fact: MemoryFact) => void;
  onForget: (ids: string[]) => void;
  onClearAll: () => void;
  /** "Update Data Memory" - re-reads the store and stamps it as just refreshed. */
  onRefresh: () => void;
  onClose: () => void;
  /** Toast, so the user gets confirmation of what the prompt field just did. */
  onNotice: (message: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Newest write drives the header subtitle; no facts means nothing to date.
  const updatedAt = facts.length > 0 ? Math.max(...facts.map((f) => f.createdAt)) : null;

  // One paragraph per heading, empty headings dropped.
  const groups = MEMORY_GROUPS.map((g) => ({
    ...g,
    body: facts.filter((f) => f.group === g.id).map((f) => f.text).join(' '),
  })).filter((g) => g.body.length > 0);

  const handleSubmit = (input: string) => {
    const command = parseMemoryCommand(input);
    if (!command) return;

    if (command.kind === 'forget') {
      const hits = facts.filter((f) => matchesForget(f, command.query));
      if (hits.length === 0) {
        onNotice('Nothing in memory matches that');
        return;
      }
      onForget(hits.map((f) => f.id));
      onNotice(hits.length === 1 ? 'Removed from memory' : `Removed ${hits.length} from memory`);
      return;
    }

    onAdd(makeFact(command.text));
    onNotice('Memory updated');
  };

  return (
    <div
      style={{
        ...screenStyle,
        background: '#0A0A0A',
        zIndex: 200,
        animation: 'screenSlideInRight 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both',
      }}
    >
      <Header
        title="Manage Data Memory"
        subtitle={updatedAt ? `Updated ${relativeTime(updatedAt)}` : 'Nothing saved yet'}
        // Both header controls are the bordered `buttonIcon` in the design, so
        // the leading slot takes one too rather than the bare back arrow.
        left={
          <button onClick={onClose} aria-label="Back" style={sheetIconButtonStyle}>
            <MIcon name="arrow_left_alt" size={20} color={TEXT_PRIMARY} />
          </button>
        }
        right={
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Memory options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            style={sheetIconButtonStyle}
          >
            <MIcon name="more_horiz" size={20} color={TEXT_PRIMARY} />
          </button>
        }
      />

      <div style={{ ...bodyStyle, paddingBottom: 8, display: groups.length === 0 ? 'flex' : undefined }}>
        {groups.length > 0 ? (
          <div style={{ padding: '12px 20px 16px' }}>
            <div
              style={{
                background: SURFACE,
                borderRadius: theme.radii.card,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {groups.map((g) => (
                <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: '20px',
                      color: TEXT_SECONDARY,
                    }}
                  >
                    {g.label}
                  </h3>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: TEXT_TERTIARY }}>
                    {g.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: 16,
              textAlign: 'center',
            }}
          >
            <span
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: theme.radii.button,
                background: '#252526',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-hidden
            >
              <MIcon name="menu_book" size={24} color={TEXT_PRIMARY} />
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 500, lineHeight: '22px', color: TEXT_PRIMARY }}>
                Nothing saved yet
              </p>
              <p style={{ margin: 0, fontSize: 16, lineHeight: '22px', color: TEXT_SECONDARY, opacity: 0.7 }}>
                As you share your tastes, they'll appear here so I can tailor every suggestion.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Figma node 5381-8383: the prompt field with no tab bar under it. */}
      <BottomDock placeholder="Add things to remember or change" showAttach={false} onSend={handleSubmit} />

      {menuOpen && (
        <ContextualMenu
          top={`calc(env(safe-area-inset-top, 0px) + 56px)`}
          onClose={() => setMenuOpen(false)}
          items={[
            {
              icon: 'refresh',
              label: 'Update Data Memory',
              onClick: () => {
                onRefresh();
                onNotice('Memory refreshed');
              },
            },
            // Not tinted red: the design keeps both rows on textPrimary and
            // leaves the warning to the confirm dialog.
            { icon: 'delete', label: 'Delete all memory', onClick: () => setConfirmDelete(true) },
          ]}
        />
      )}

      {confirmDelete && (
        <Dialog
          title="Are you sure you want to delete your memory?"
          body="This action is irreversible and it will delete your data permanently."
          confirmLabel="Delete my data"
          onConfirm={() => {
            setConfirmDelete(false);
            onClearAll();
            onNotice('Memory deleted');
          }}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
