import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../components/Icon';
import ChatBar from '../components/ChatBar';
import { screenStyle, bodyStyle, Header, iconButtonStyle } from './screenChrome';
import { extractMemory, makeFact, type MemoryFact } from '../data/memory';

// ─── Chat tab ────────────────────────────────────────────────────────────────
//
// Figma: "Chat / Memory" (node 5303-20889). The concierge thread. Its part in the
// Data Memory feature: when a message asks to be remembered, the fact is written
// to memory and the reply carries a "Memory updated" chip.
//
// When Data Memory is switched off the fact is not stored and the reply says so,
// so the toggle in Menu > Data Memory is never silently ignored.

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

const SUGGESTIONS = [
  'Remember that I like Van Cleef & Arpels as a brand',
  'What do you remember about me?',
];

const RECALL = /\b(what do you (remember|know)|what'?s in (my )?memory|remind me what)\b/i;

let msgSeq = 0;
const nextId = () => `msg-${(msgSeq += 1)}`;

export default function ChatScreen({
  memoryEnabled,
  facts,
  messages,
  onMessagesChange,
  ratings,
  onRatingsChange,
  onAddFact,
  onNotice,
  bottomBar,
}: {
  memoryEnabled: boolean;
  facts: MemoryFact[];
  /** Thread + thumb state live in the feed so leaving the tab does not wipe them. */
  messages: ChatMessage[];
  onMessagesChange: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  ratings: Record<string, 'up' | 'down'>;
  onRatingsChange: React.Dispatch<React.SetStateAction<Record<string, 'up' | 'down'>>>;
  onAddFact: (fact: MemoryFact) => void;
  onNotice: (message: string) => void;
  bottomBar?: ReactNode;
}) {
  const [thinking, setThinking] = useState(false);

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
          text: 'Data Memory is switched off, so I am not keeping anything between chats. You can turn it back on in Menu > Data Memory.',
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
            text: 'I can work with that for this chat, but Data Memory is switched off so it will not be saved. Turn it on in Menu > Data Memory and I will remember it next time.',
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
    onMessagesChange((prev) => [...prev, { id: nextId(), role: 'assistant', ...reply(p.text, p.fact) }]);
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

  const empty = messages.length === 0 && !thinking;

  return (
    <div style={screenStyle}>
      <Header
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <img src="/vip-logo.svg" alt="" aria-hidden style={{ width: 16, height: 16, opacity: 0.9 }} />
            Concierge
            <Icon name="chevron-down" size={16} color="#fff" />
          </span>
        }
        right={
          <span style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                if (replyTimer.current) clearTimeout(replyTimer.current);
                pending.current = null;
                onMessagesChange([]);
                onRatingsChange({});
                setThinking(false);
              }}
              aria-label="New chat"
              style={iconButtonStyle}
            >
              <Icon name="edit" size={18} color="#fff" />
            </button>
            <button
              onClick={() => onNotice('Chat options open here')}
              aria-label="More options"
              style={iconButtonStyle}
            >
              <Icon name="more-horizontal" size={18} color="#fff" />
            </button>
          </span>
        }
      />

      <div ref={bodyRef} style={{ ...bodyStyle, paddingBottom: 8 }}>
        {empty ? (
          <EmptyChat onPick={send} />
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
                  onNotice={onNotice}
                />
              ),
            )}
            {thinking && <Thinking />}
          </div>
        )}
      </div>

      <ChatBar placeholder="Your instruction.." onSend={send} />
      {bottomBar}
    </div>
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
  onNotice,
}: {
  message: ChatMessage;
  rating?: 'up' | 'down';
  onRate: (r: 'up' | 'down') => void;
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

      {message.memoryUpdated && (
        <span
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            height: 40,
            padding: '8px 12px',
            borderRadius: 16,
            border: '1px solid #313131',
            background: '#141414',
            fontSize: 14,
            lineHeight: '20px',
            color: TEXT_PRIMARY,
          }}
        >
          <Icon name="check" size={16} color={TEXT_PRIMARY} />
          Memory updated
        </span>
      )}

      <p style={{ margin: 0, fontSize: 16, lineHeight: '22px', color: TEXT_PRIMARY, whiteSpace: 'pre-wrap' }}>
        {message.text}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: -8 }}>
        <ActionButton
          icon="copy"
          label="Copy"
          onClick={() => {
            navigator.clipboard?.writeText(message.text);
            onNotice('Copied to clipboard');
          }}
        />
        <ActionButton icon="sync" label="Regenerate" onClick={() => onNotice('Regenerating the answer')} />
        <ActionButton icon="like" label="Good answer" active={rating === 'up'} onClick={() => onRate('up')} />
        <ActionButton
          icon="dislike"
          label="Bad answer"
          active={rating === 'down'}
          onClick={() => onRate('down')}
        />
        <ActionButton icon="more-horizontal" label="More" onClick={() => onNotice('More actions open here')} />
      </div>
    </div>
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
        borderRadius: 12,
        cursor: 'pointer',
        padding: 0,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Icon name={icon} size={20} color={active ? '#fff' : '#c9c9c9'} />
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

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyChat({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '72px 24px 24px',
        textAlign: 'center',
      }}
    >
      <img src="/vip-logo.svg" alt="" aria-hidden style={{ width: 44, height: 44, opacity: 0.9 }} />
      <p style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 600, lineHeight: '28px', color: TEXT_PRIMARY }}>
        Ask anything
      </p>
      <p style={{ margin: 0, fontSize: 14, lineHeight: '20px', color: '#999' }}>
        Tell the concierge what to remember and it carries across every chat.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 16 }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: SURFACE,
              border: '1px solid #282828',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 14,
              lineHeight: '20px',
              color: TEXT_SECONDARY,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
