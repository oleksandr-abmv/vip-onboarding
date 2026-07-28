import { useState } from 'react';
import { Icon } from '../components/Icon';
import ChatBar from '../components/ChatBar';
import Dialog from '../components/Dialog';
import { screenStyle, bodyStyle, Header, iconButtonStyle } from './screenChrome';
import {
  makeFact,
  matchesForget,
  parseMemoryCommand,
  relativeTime,
  type MemoryFact,
} from '../data/memory';

// ─── Manage Memory ───────────────────────────────────────────────────────────
//
// Figma: "Settings / Memory [More]" (node 5381-8376) and its delete confirmation
// (node 5381-8482). Full-screen overlay pushed from the Memory sheet: header with
// back + "Updated ..." + a trash action, the remembered facts as body copy, and
// an "Ask to add or update" prompt field pinned to the bottom.

const TEXT_SECONDARY = '#f4f5f7';

export default function MemoryScreen({
  facts,
  onAdd,
  onForget,
  onClearAll,
  onClose,
  onNotice,
}: {
  facts: MemoryFact[];
  onAdd: (fact: MemoryFact) => void;
  onForget: (ids: string[]) => void;
  onClearAll: () => void;
  onClose: () => void;
  /** Toast, so the user gets confirmation of what the prompt field just did. */
  onNotice: (message: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Newest write drives the header subtitle; no facts means nothing to date.
  const updatedAt = facts.length > 0 ? Math.max(...facts.map((f) => f.createdAt)) : null;

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
    <div style={{ ...screenStyle, background: '#0A0A0A', zIndex: 200, animation: 'screenSlideInRight 300ms cubic-bezier(0.25, 0.1, 0.25, 1) both' }}>
      <Header
        title="Manage Memory"
        subtitle={updatedAt ? `Updated ${relativeTime(updatedAt)}` : 'Nothing saved yet'}
        onBack={onClose}
        right={
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete memory"
            disabled={facts.length === 0}
            style={{
              ...iconButtonStyle,
              opacity: facts.length === 0 ? 0.4 : 1,
              cursor: facts.length === 0 ? 'default' : 'pointer',
            }}
          >
            <Icon name="trash" size={18} color="#fff" />
          </button>
        }
      />

      <div style={{ ...bodyStyle, paddingBottom: 8 }}>
        {facts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 20px 16px' }}>
            {facts.map((fact) => (
              <p
                key={fact.id}
                style={{ margin: 0, fontSize: 16, lineHeight: '22px', color: TEXT_SECONDARY }}
              >
                {fact.text}
              </p>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '80px 40px',
              textAlign: 'center',
            }}
          >
            <Icon name="book-open" size={28} color="#5f5f5f" />
            <p style={{ margin: '4px 0 0', fontSize: 16, lineHeight: '22px', color: '#f6f6f6' }}>
              Nothing saved yet
            </p>
            <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: '#999' }}>
              Tell the concierge what to remember, here or in a chat, and it will show up on this page.
            </p>
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0, paddingBottom: `calc(8px + env(safe-area-inset-bottom, 0px))` }}>
        <ChatBar placeholder="Ask to add or update" showAttach={false} onSend={handleSubmit} />
      </div>

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
