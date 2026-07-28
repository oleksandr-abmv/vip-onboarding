import { useEffect, useRef, useState } from 'react';
import MIcon from '../components/MIcon';
import BottomDock, { type DockTab } from '../components/BottomDock';
import MemorySheet from '../components/MemorySheet';
import { screenStyle, bodyStyle, Header, iconButtonStyle } from './screenChrome';
import { extractMemory, makeFact, type MemoryFact } from '../data/memory';
import { theme } from '../theme';

// ─── Chat tab ────────────────────────────────────────────────────────────────
//
// Figma: "Chat Idle" (node 4483-34608) for the empty state and "Chat / Memory"
// (node 5303-20889) for a thread. Its part in the Memory feature: when a
// message asks to be remembered, the fact is written to memory and the reply
// carries a tappable "Memory updated" chip that opens the Memory sheet.
//
// When Memory is switched off the fact is not stored and the reply says so,
// so the toggle in Menu > Memory is never silently ignored.

const SURFACE = '#1b1b1c';
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#f4f5f7';
const PAGE = 16;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** Assistant only: renders the "Memory updated" chip above the text. */
  memoryUpdated?: boolean;
}

// Figma "Chat Suggestions" rows (node 5268-8938).
const SUGGESTIONS = [
  { icon: 'search', label: 'Find a piece & where to buy', prompt: 'Find me a piece and where to buy it' },
  { icon: 'apparel', label: 'Style a look & virtual try-on', prompt: 'Style a look for me' },
  { icon: 'auto_awesome', label: 'Ask the concierge', prompt: 'Remember that I like Van Cleef & Arpels as a brand' },
  { icon: 'palette', label: 'Search by color', prompt: 'Show me pieces in deep green' },
];

const RECALL = /\b(what do you (remember|know)|what'?s in (my )?memory|remind me what)\b/i;

let msgSeq = 0;
const nextId = () => `msg-${(msgSeq += 1)}`;

export default function ChatScreen({
  memoryEnabled,
  onMemoryEnabledChange,
  facts,
  messages,
  onMessagesChange,
  ratings,
  onRatingsChange,
  onAddFact,
  onManageMemory,
  onNotice,
  tabs,
}: {
  memoryEnabled: boolean;
  onMemoryEnabledChange: (enabled: boolean) => void;
  facts: MemoryFact[];
  /** Thread + thumb state live in the feed so leaving the tab does not wipe them. */
  messages: ChatMessage[];
  onMessagesChange: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  ratings: Record<string, 'up' | 'down'>;
  onRatingsChange: React.Dispatch<React.SetStateAction<Record<string, 'up' | 'down'>>>;
  onAddFact: (fact: MemoryFact) => void;
  onManageMemory: () => void;
  /** Snackbar, including the one that confirms a memory write. */
  onNotice: (message: string, action?: { label: string; onAction: () => void }) => void;
  tabs: DockTab[];
}) {
  const [thinking, setThinking] = useState(false);
  // The Memory sheet, opened by tapping a "Memory updated" chip.
  const [memorySheet, setMemorySheet] = useState(false);

  // Newest turn should be visible without the user scrolling for it.
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  // `facts` is read inside the deferred reply, so keep a live handle on it rather
  // than closing over the value from render time.
  const factsRef = useRef(facts);
  useEffect(() => { factsRef.current = facts; }, [facts]);

  /** Pick the concierge's answer for a message. */
  const reply = (text: string, fact: string | null): { text: string; memoryUpdated?: boolean } => {
    if (RECALL.test(text)) {
      const current = factsRef.current;
      if (!memoryEnabled) {
        return {
          text: 'Memory is switched off, so I am not keeping anything between chats. You can turn it back on in Menu > Memory.',
        };
      }
      if (current.length === 0) {
        return {
          text: 'Nothing yet. Tell me what matters to you - a house you collect, your sizes, what to keep away from - and I will hold on to it.',
        };
      }
      return { text: `Here is what I have so far:\n${current.map((f) => `- ${f.text}`).join('\n')}` };
    }

    if (fact) {
      return memoryEnabled
        ? {
            text: 'Noted. I will keep these preferences in mind, and you can always manage them from the settings or just ask me to edit.',
            memoryUpdated: true,
          }
        : {
            text: 'I can work with that for this chat, but Memory is switched off so it will not be saved. Turn it on in Menu > Memory and I will remember it next time.',
          };
    }

    return {
      text: 'I am on it. Give me a moment to pull together a few pieces that fit what you are after.',
    };
  };

  // The reply lands on a timer. If the user leaves the tab before it fires, hand
  // the answer over immediately rather than dropping the turn on the floor.
  const replyTimer = useRef<number | null>(null);
  const pending = useRef<{ text: string; fact: string | null } | null>(null);

  const deliver = () => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    setThinking(false);
    const answer = reply(p.text, p.fact);
    onMessagesChange((prev) => [...prev, { id: nextId(), role: 'assistant', ...answer }]);
    // The chip alone is easy to miss, so confirm the write with a snackbar that
    // offers the same shortcut into the Memory sheet.
    if (answer.memoryUpdated) {
      onNotice('Memory updated', { label: 'Manage', onAction: () => setMemorySheet(true) });
    }
  };
  // Cleanup runs once, so it needs the latest closure rather than the first one.
  const deliverRef = useRef(deliver);
  useEffect(() => { deliverRef.current = deliver; });
  useEffect(
    () => () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
      deliverRef.current();
    },
    [],
  );

  const send = (text: string) => {
    onMessagesChange((prev) => [...prev, { id: nextId(), role: 'user', text }]);
    setThinking(true);

    const fact = extractMemory(text);
    if (fact && memoryEnabled) onAddFact(makeFact(fact));

    if (replyTimer.current) clearTimeout(replyTimer.current);
    pending.current = { text, fact };
    replyTimer.current = window.setTimeout(() => deliverRef.current(), 700);
  };

  const newChat = () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    pending.current = null;
    onMessagesChange([]);
    onRatingsChange({});
    setThinking(false);
  };

  const empty = messages.length === 0 && !thinking;

  return (
    <div style={screenStyle}>
      <Header
        height={56}
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
            <img src="/vip-logo.svg" alt="" aria-hidden style={{ width: 24, height: 24 }} />
            <span style={{ fontSize: 16, fontWeight: 500, lineHeight: '20px' }}>Concierge</span>
            <MIcon name="keyboard_arrow_down" size={18} color={TEXT_PRIMARY} />
          </span>
        }
        left={
          <button onClick={newChat} aria-label="New chat" style={iconButtonStyle}>
            <MIcon name="edit_square" size={24} color={TEXT_PRIMARY} />
          </button>
        }
        right={
          <span style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onNotice('Temporary chat is off')}
              aria-label="Temporary chat"
              style={iconButtonStyle}
            >
              <MIcon name="crop_free" size={24} color={TEXT_PRIMARY} />
            </button>
            <button
              onClick={() => onNotice('Chat options open here')}
              aria-label="More options"
              style={iconButtonStyle}
            >
              <MIcon name="more_horiz" size={24} color={TEXT_PRIMARY} />
            </button>
          </span>
        }
      />

      <div
        ref={bodyRef}
        style={{
          ...bodyStyle,
          paddingTop: `calc(env(safe-area-inset-top, 0px) + 56px)`,
          paddingBottom: 8,
          // The idle screen is a single column: copy centered in the free space,
          // suggestions parked just above the dock.
          display: empty ? 'flex' : undefined,
          flexDirection: empty ? 'column' : undefined,
        }}
      >
        {empty ? (
          <ChatIdle onPick={send} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: PAGE }}>
            {messages.map((m) =>
              m.role === 'user' ? (
                <UserBubble key={m.id} text={m.text} />
              ) : (
                <AssistantTurn
                  key={m.id}
                  message={m}
                  rating={ratings[m.id]}
                  onRate={(r) =>
                    onRatingsChange((prev) => {
                      const next = { ...prev };
                      // Pressing the active thumb again clears the rating.
                      if (next[m.id] === r) delete next[m.id];
                      else next[m.id] = r;
                      return next;
                    })
                  }
                  onOpenMemory={() => setMemorySheet(true)}
                  onNotice={onNotice}
                />
              ),
            )}
            {thinking && <Thinking />}
          </div>
        )}
      </div>

      <BottomDock tabs={tabs} placeholder="Your instruction.." onSend={send} />

      {memorySheet && (
        <MemorySheet
          enabled={memoryEnabled}
          onToggle={() => onMemoryEnabledChange(!memoryEnabled)}
          onManage={() => {
            setMemorySheet(false);
            onManageMemory();
          }}
          onClose={() => setMemorySheet(false)}
        />
      )}
    </div>
  );
}

// ─── Idle state (Figma "Chat Idle", node 4483-34608) ─────────────────────────

function ChatIdle({ onPick }: { onPick: (text: string) => void }) {
  return (
    <>
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: `0 ${PAGE}px`,
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: 24, fontWeight: 600, lineHeight: '28px', color: TEXT_PRIMARY }}>
          What would you like arranged?
        </p>
        <p style={{ margin: 0, fontSize: 16, lineHeight: '22px', color: TEXT_SECONDARY, opacity: 0.7 }}>
          Find products, places, ask about luxury, news, events, and more.
        </p>
      </div>

      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: `0 ${PAGE}px 8px`,
        }}
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => onPick(s.prompt)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              width: '100%',
              height: 46,
              padding: 12,
              // Figma Chat Suggestions: a pill, unlike the prompt field.
              borderRadius: theme.radii.chip,
              background: SURFACE,
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <MIcon name={s.icon} size={22} color={TEXT_PRIMARY} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 16, lineHeight: '22px', color: TEXT_PRIMARY }}>
              {s.label}
            </span>
            <MIcon name="keyboard_arrow_right" size={22} color="#8b8b8b" />
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Turns ───────────────────────────────────────────────────────────────────

function UserBubble({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div
        style={{
          maxWidth: '85%',
          background: SURFACE,
          // Square bottom-right corner points the bubble at the sender.
          borderRadius: '12px 12px 0 12px',
          padding: 12,
          fontSize: 16,
          lineHeight: '22px',
          color: TEXT_PRIMARY,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function AssistantTurn({
  message,
  rating,
  onRate,
  onOpenMemory,
  onNotice,
}: {
  message: ChatMessage;
  rating?: 'up' | 'down';
  onRate: (r: 'up' | 'down') => void;
  onOpenMemory: () => void;
  onNotice: (message: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: 100,
            background: '#02110c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-hidden
        >
          <img src="/vip-logo.svg" alt="" style={{ width: 15, height: 15 }} />
        </span>
        <span style={{ fontSize: 14, lineHeight: '20px', color: TEXT_PRIMARY }}>VIP.ai Concierge</span>
      </div>

      {message.memoryUpdated && <MemoryChip onClick={onOpenMemory} />}

      <p style={{ margin: 0, fontSize: 16, lineHeight: '22px', color: TEXT_PRIMARY, whiteSpace: 'pre-wrap' }}>
        {message.text}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: -8 }}>
        <ActionButton
          icon="content_copy"
          label="Copy"
          onClick={() => {
            navigator.clipboard?.writeText(message.text);
            onNotice('Copied to clipboard');
          }}
        />
        <ActionButton icon="autorenew" label="Regenerate" onClick={() => onNotice('Regenerating the answer')} />
        <ActionButton icon="thumb_up" label="Good answer" active={rating === 'up'} onClick={() => onRate('up')} />
        <ActionButton
          icon="thumb_down"
          label="Bad answer"
          active={rating === 'down'}
          onClick={() => onRate('down')}
        />
        <ActionButton icon="more_horiz" label="More" onClick={() => onNotice('More actions open here')} />
      </div>
    </div>
  );
}

/**
 * "Memory updated" chip (Figma Chip, node 5303-21143): a 40px bordered pill.
 * Carries the Memory glyph and a chevron, because tapping it opens the
 * Memory sheet - the second way into editing what the concierge remembers.
 */
function MemoryChip({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Memory updated, open memory settings"
      style={{
        alignSelf: 'flex-start',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 40,
        padding: '8px 12px',
        borderRadius: theme.radii.chip,
        border: '1px solid #444547',
        background: '#101111',
        fontSize: 14,
        lineHeight: '20px',
        color: TEXT_PRIMARY,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <MIcon name="menu_book" size={18} color={TEXT_PRIMARY} />
      Memory updated
      <MIcon name="keyboard_arrow_right" size={18} color="#8b8b8b" />
    </button>
  );
}

function ActionButton({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active || undefined}
      style={{
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? 'rgba(246,246,246,0.12)' : 'none',
        border: 'none',
        borderRadius: theme.radii.button,
        cursor: 'pointer',
        padding: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <MIcon name={icon} size={20} color={active ? '#fff' : '#c9c9c9'} />
    </button>
  );
}

function Thinking() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }} role="status" aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 100,
            background: '#7a7a7a',
            animation: `typingDot 1100ms ease-in-out ${i * 160}ms infinite`,
          }}
        />
      ))}
    </div>
  );
}
