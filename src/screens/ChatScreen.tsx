import { useEffect, useRef, useState } from 'react';
import MIcon from '../components/MIcon';
import BottomDock, { type DockTab } from '../components/BottomDock';
import CollectionCard from '../components/CollectionCard';
import MemorySheet from '../components/MemorySheet';
import TemporaryChatIcon from '../components/TemporaryChatIcon';
import { screenStyle, bodyStyle, Header, iconButtonStyle } from './screenChrome';
import { extractMemory, makeFact, type MemoryFact } from '../data/memory';
import { theme } from '../theme';

// ─── Chat tab ────────────────────────────────────────────────────────────────
//
// Figma: "Chat Idle" (node 4483-34608) for the empty state and "Chat / Memory"
// (node 5303-20889) for a thread. Its part in the Data Memory feature: when a
// message asks to be remembered, the fact is written to memory and the reply
// carries a tappable "Memory updated" chip that opens the Memory sheet.
//
// When Data Memory is switched off the fact is not stored and the reply says so,
// so the toggle in Settings › Data Memory is never silently ignored.

const SURFACE = '#1b1b1c';
const TEXT_PRIMARY = '#f6f6f6';
const TEXT_SECONDARY = '#f4f5f7';
const PAGE = 16;

/**
 * What an attachment card points back at. The chat only carries the descriptor;
 * FeedScreen owns the collections and the product page, so it does the opening.
 * A scan with no confident match has no destination and stays inert.
 */
export type AttachmentTarget =
  | { kind: 'collection'; id: string }
  | { kind: 'product'; name: string };

export interface ChatAttachment {
  title: string;
  subtitle?: string;
  /** Up to 4 images; one renders as a single tile, more as a 2x2 cover. */
  images: string[];
  /** Makes the card tappable: it opens the thing the message is about. */
  target?: AttachmentTarget;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /**
   * On a **user** message: the collection / scan context it was sent with.
   * On an **assistant** message: what the concierge is handing back - the
   * collection in its **new** state after it changed something, so "update this
   * collection" answers with the collection rather than a sentence about it.
   * Either way the card is tappable and opens what it names.
   */
  attachment?: ChatAttachment;
  /** Assistant only: renders the "Memory updated" chip above the text. */
  memoryUpdated?: boolean;
}

// Figma "Chat Suggestions" rows (node 5268-8938) - these four labels and glyphs
// come straight from the file; keep them in step with it.
//
// "Find a piece" and "Search by color" are not a search feature returning: with
// no search box anywhere, asking the concierge IS how you look something up, and
// these rows are a menu of things to say to it. The prompts deliberately name no
// specific piece, because the catalogue is gender-filtered and a hardcoded name
// is absent for half the users.
const SUGGESTIONS = [
  { icon: 'search', label: 'Find a piece & where to buy', prompt: 'Find me a piece and where to buy it' },
  { icon: 'apparel', label: 'Style a look & virtual try-on', prompt: 'Style a look for me' },
  // The one place the sparkle stays rather than the VIP mark: these four rows are
  // a menu of things to type, so the glyph is labelling a kind of prompt, not
  // standing in for the concierge (whose name is already in the label).
  { icon: 'auto_awesome', label: 'Ask the concierge', prompt: 'Remember that I like Van Cleef & Arpels as a brand' },
  { icon: 'palette', label: 'Search by color', prompt: 'Show me pieces in deep green' },
];

const RECALL = /\b(what do you (remember|know)|what'?s in (my )?memory|remind me what)\b/i;

/**
 * "update this collection with new products", "add a few pieces", "expand it".
 * Deliberately loose: this only ever runs when the thread already carries a
 * collection, so the verb plus something to act on is enough, and being asked
 * to add to a collection you are already holding has one obvious meaning.
 */
const UPDATE_VERB = /\b(update|add|expand|refresh|complete|extend|fill|grow|build (out|up))\b/i;
const UPDATE_OBJECT = /\b(collection|look|it|this|that|piece|pieces|product|products|item|items)\b/i;
const wantsCollectionUpdate = (text: string) =>
  UPDATE_VERB.test(text) && UPDATE_OBJECT.test(text);

/**
 * "Find me pieces like this", "something similar", "more like the Kelly Bag",
 * "put together a collection". Checked **before** the update intent, because
 * "find me more pieces like this" reads as both and the user is asking for new
 * pieces, not for an existing collection to grow.
 */
const WANTS_SIMILAR =
  /\b(similar|like (this|that|it|the)|more like|goes? with|match(es|ing)?|alongside|comparable|in the same vein|put together (a|me a)? ?(collection|set|edit)|pull together|curate)\b/i;

/** The "Ask AI Concierge" hand-off payload (scan results / collection page). */
export interface ConciergePrompt {
  text: string;
  attachment?: ChatAttachment;
}

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
  initialPrompt,
  onPromptConsumed,
  onOpenAttachment,
  onUpdateCollection,
  onProposeCollection,
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
  /** Auto-sent on entry (the scan results / collection "Ask AI Concierge"). */
  initialPrompt?: ConciergePrompt | null;
  onPromptConsumed?: () => void;
  /** Opens what an attachment card names. Omit and the cards stay inert. */
  onOpenAttachment?: (target: AttachmentTarget) => void;
  /**
   * Actually put pieces into a collection, and hand back what changed. Asking
   * the concierge to update a collection has to *update the collection* - a
   * sentence promising to is the one answer that would be a lie - so this is
   * the write, and the reply is built from what it returns. `null` when there
   * is nothing left to add.
   */
  onUpdateCollection?: (id: string) => { added: string[]; attachment: ChatAttachment } | null;
  /**
   * Put together a set of pieces like `seed` (or across the catalogue without
   * one) and hand it back as an **unsaved** collection - the user opens it and
   * decides. `text` is the message itself, so a piece merely *named* in the
   * sentence still anchors the picks. `null` when there is nothing left to pick.
   */
  onProposeCollection?: (seed?: string, text?: string) => {
    name: string;
    anchor: string | null;
    count: number;
    attachment: ChatAttachment;
  } | null;
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
  // Same for the thread: `send` reads it to work out which collection is in play.
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  /**
   * Which collection this turn is about: the one just attached, or the last one
   * attached earlier in the thread. Once you have handed a collection over, the
   * rest of the conversation is still about it - "update it" three messages
   * later means the same collection it meant at the top.
   */
  const collectionInPlay = (incoming?: ChatAttachment): string | null => {
    if (incoming?.target?.kind === 'collection') return incoming.target.id;
    for (let i = messagesRef.current.length - 1; i >= 0; i -= 1) {
      const target = messagesRef.current[i].attachment?.target;
      if (target?.kind === 'collection') return target.id;
    }
    return null;
  };

  /** The piece this turn is about, the same way `collectionInPlay` works. */
  const pieceInPlay = (incoming?: ChatAttachment): string | null => {
    if (incoming?.target?.kind === 'product') return incoming.target.name;
    for (let i = messagesRef.current.length - 1; i >= 0; i -= 1) {
      const target = messagesRef.current[i].attachment?.target;
      if (target?.kind === 'product') return target.name;
    }
    return null;
  };

  /** Pick the concierge's answer for a message. */
  const reply = (text: string, fact: string | null): { text: string; memoryUpdated?: boolean } => {
    if (RECALL.test(text)) {
      const current = factsRef.current;
      if (!memoryEnabled) {
        return {
          text: 'Data Memory is switched off, so I am not keeping anything between chats. You can turn it back on in Settings › Data Memory.',
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
            text: 'Noted. I’ll remember that preference. You can review or edit anything I keep in Settings › Data Memory, or simply tell me.',
            memoryUpdated: true,
          }
        : {
            text: 'I can work with that for this chat, but Data Memory is switched off so it will not be saved. Turn it on in Settings › Data Memory and I will remember it next time.',
          };
    }

    return {
      text: 'I am on it. Give me a moment to pull together a few pieces that fit what you are after.',
    };
  };

  // The reply lands on a timer. If the user leaves the tab before it fires, hand
  // the answer over immediately rather than dropping the turn on the floor.
  const replyTimer = useRef<number | null>(null);
  const pending = useRef<{
    text: string;
    fact: string | null;
    updateCollectionId: string | null;
    proposeFrom: { seed: string | null } | null;
  } | null>(null);

  const deliver = () => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    setThinking(false);

    // Asked for pieces like something, the concierge picks a handful and hands
    // them over as a collection - already assembled, not yet kept. The copy has
    // one job beyond saying what it found: make clear the set is a thing you can
    // keep, and that keeping it is still your call.
    if (p.proposeFrom && onProposeCollection) {
      const proposal = onProposeCollection(p.proposeFrom.seed ?? undefined, p.text);
      if (proposal) {
        const opener = proposal.anchor
          ? `Here are ${proposal.count} pieces that sit alongside the ${proposal.anchor}.`
          : `Here are ${proposal.count} pieces I would put together for you.`;
        onMessagesChange((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            text: `${opener} I have gathered them into "${proposal.name}". Open it to save it to your collections.`,
            attachment: proposal.attachment,
          },
        ]);
        return;
      }
      onMessagesChange((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          text: 'Everything close to that is already in one of your collections. Tell me the occasion or the budget and I will look wider.',
        },
      ]);
      return;
    }

    // Asked to change a collection it is already holding, the concierge changes
    // it - the write happens here, at answer time, so the pause reads as work -
    // and answers with the collection's new state rather than a promise.
    if (p.updateCollectionId && onUpdateCollection) {
      const result = onUpdateCollection(p.updateCollectionId);
      if (result) {
        const { added, attachment } = result;
        const list =
          added.length === 1
            ? added[0]
            : `${added.slice(0, -1).join(', ')} and ${added[added.length - 1]}`;
        onMessagesChange((prev) => [
          ...prev,
          {
            id: nextId(),
            role: 'assistant',
            text: `Done. I added ${list} to "${attachment.title}", which now holds ${attachment.subtitle}.`,
            attachment,
          },
        ]);
        return;
      }
      onMessagesChange((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          text: 'That collection already has everything I would put in it. Tell me the occasion or the budget you have in mind and I will look wider.',
        },
      ]);
      return;
    }

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
  // On unmount, hand the pending reply over instead of dropping the turn. The
  // delivery is deferred a tick and cancelled on an immediate remount
  // (StrictMode's simulated unmount), which otherwise answered the auto-sent
  // concierge prompt instantly in dev; the reply timer restarts in that case.
  const unmountDeliver = useRef<number | null>(null);
  useEffect(() => {
    if (unmountDeliver.current) {
      clearTimeout(unmountDeliver.current);
      unmountDeliver.current = null;
      if (pending.current && !replyTimer.current) {
        replyTimer.current = window.setTimeout(() => deliverRef.current(), 700);
      }
    }
    return () => {
      if (replyTimer.current) {
        clearTimeout(replyTimer.current);
        replyTimer.current = null;
      }
      unmountDeliver.current = window.setTimeout(() => deliverRef.current(), 0);
    };
  }, []);

  const send = (text: string, attachment?: ChatAttachment) => {
    // Both resolved before the message is appended, so "it" and "this" still
    // refer to the last thing handed over rather than to this message.
    // "Similar" wins over "update": "find me more pieces like this" reads as
    // both, and what is being asked for is new pieces, not a bigger collection.
    const propose = WANTS_SIMILAR.test(text) ? { seed: pieceInPlay(attachment) } : null;
    const target = !propose && wantsCollectionUpdate(text) ? collectionInPlay(attachment) : null;
    onMessagesChange((prev) => [...prev, { id: nextId(), role: 'user', text, attachment }]);
    setThinking(true);

    const fact = extractMemory(text);
    if (fact && memoryEnabled) onAddFact(makeFact(fact));

    if (replyTimer.current) clearTimeout(replyTimer.current);
    pending.current = { text, fact, updateCollectionId: target, proposeFrom: propose };
    replyTimer.current = window.setTimeout(() => deliverRef.current(), 700);
  };

  // "Ask AI Concierge" hand-off: a prompt from the scan results or a collection
  // is sent as if the user typed it (with its attachment). It appends, so it
  // works the same whether the caller cleared the thread first (the usual "new
  // chat" hand-off) or kept it (a page opened from this very conversation).
  // Ref-guarded so a
  // StrictMode double effect (or a re-render before the parent clears the
  // prop) cannot send it twice.
  const lastPrompt = useRef<ConciergePrompt | null>(null);
  useEffect(() => {
    if (!initialPrompt) {
      lastPrompt.current = null;
      return;
    }
    if (lastPrompt.current === initialPrompt) return;
    lastPrompt.current = initialPrompt;
    send(initialPrompt.text, initialPrompt.attachment);
    onPromptConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

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
        // The nav bar actions depend on whether the thread has anything in it.
        // Idle (Figma node 5410-6912) offers the two ways to start, Incognito
        // mode and History, and keeps New chat in place but disabled - there is
        // no thread to clear yet. Once there is a message Incognito gives way to
        // More, and History stays put across both states.
        left={
          <button onClick={newChat} aria-label="New chat" style={iconButtonStyle}>
            <MIcon name="edit_square" size={24} color={TEXT_PRIMARY} />
          </button>
        }
        right={
          <span style={{ display: 'flex', gap: 8 }}>
            {empty ? (
              <>
                <button
                  onClick={() => onNotice('Incognito mode is off')}
                  aria-label="Incognito mode"
                  style={iconButtonStyle}
                >
                  {/* The design's own vector, not a Material glyph. */}
                  <TemporaryChatIcon size={24} color={TEXT_PRIMARY} />
                </button>
                <button
                  onClick={() => onNotice('Chat history opens here')}
                  aria-label="History"
                  style={iconButtonStyle}
                >
                  <MIcon name="history" size={24} color={TEXT_PRIMARY} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNotice('Chat history opens here')}
                  aria-label="History"
                  style={iconButtonStyle}
                >
                  <MIcon name="history" size={24} color={TEXT_PRIMARY} />
                </button>
                <button
                  onClick={() => onNotice('Chat options open here')}
                  aria-label="More options"
                  style={iconButtonStyle}
                >
                  <MIcon name="more_horiz" size={24} color={TEXT_PRIMARY} />
                </button>
              </>
            )}
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
                <UserBubble key={m.id} text={m.text} attachment={m.attachment} onOpenAttachment={onOpenAttachment} />
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
                  onOpenAttachment={onOpenAttachment}
                />
              ),
            )}
            {thinking && <Thinking />}
          </div>
        )}
      </div>

      <BottomDock tabs={tabs} placeholder="Ask your concierge..." onSend={send} />

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

function UserBubble({
  text,
  attachment,
  onOpenAttachment,
}: {
  text: string;
  attachment?: ChatAttachment;
  onOpenAttachment?: (target: AttachmentTarget) => void;
}) {
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
        {attachment && (
          <AttachmentCard
            attachment={attachment}
            onOpenAttachment={onOpenAttachment}
            // Inside a bubble the card has to read as a layer on top of it, so
            // it takes a lighter fill than the bubble rather than the page's.
            style={{ marginBottom: 8, background: 'rgba(255,255,255,0.06)' }}
          />
        )}
        {text}
      </div>
    </div>
  );
}

/**
 * The context card: what a message is *about*. On a user turn it is what they
 * attached; on a concierge turn it is what it just changed, in its new state.
 *
 * It is a button whenever the thing it names can still be opened, so "what goes
 * with this?" - and "here is your collection now" - are one tap from the thing
 * itself. A scan with no confident match, or a collection since deleted, has no
 * target and the card stays inert.
 *
 * Figma node 5558-54385 ("Your message" carrying a collection): the card is
 * `radius 16` with a hairline border, 56 tall, a 40px `radius 8` tile, and the
 * name / meta pair at 14/20 semibold over 12/16. It is **the same card on both
 * sides of the thread** - only the fill changes, since on a user turn it sits
 * inside a bubble and on a concierge turn it sits on the page.
 */
function AttachmentCard({
  attachment,
  onOpenAttachment,
  style,
}: {
  attachment: ChatAttachment;
  onOpenAttachment?: (target: AttachmentTarget) => void;
  style?: React.CSSProperties;
}) {
  const target = attachment.target;
  const open = target && onOpenAttachment ? () => onOpenAttachment(target) : undefined;
  return (
    <div
      onClick={open}
      role={open ? 'button' : undefined}
      tabIndex={open ? 0 : undefined}
      aria-label={open ? `Open ${attachment.title}` : undefined}
      onKeyDown={
        open
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open();
              }
            }
          : undefined
      }
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        // 8 all round, 12 on the trailing edge so the text does not run into
        // the corner radius.
        padding: '8px 12px 8px 8px',
        boxSizing: 'border-box',
        height: 56,
        // Wide enough that the name and meta line have room, so a bubble
        // carrying one grows to fit the card rather than squeezing it.
        minWidth: 200,
        background: SURFACE,
        border: '1px solid #313131',
        borderRadius: theme.radii.card,
        overflow: 'hidden',
        cursor: open ? 'pointer' : undefined,
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      <AttachmentCover images={attachment.images} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: '20px',
            color: TEXT_PRIMARY,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {attachment.title}
        </p>
        {attachment.subtitle && (
          <span
            style={{
              fontSize: 12,
              lineHeight: '16px',
              color: '#999',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {attachment.subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

/** 40px tile: one image renders alone, several become a 2x2 mini cover. */
function AttachmentCover({ images }: { images: string[] }) {
  const many = images.length > 1;
  return (
    <div
      aria-hidden
      style={{
        width: 40,
        height: 40,
        flexShrink: 0,
        borderRadius: 8,
        overflow: 'hidden',
        display: many ? 'grid' : 'flex',
        ...(many
          ? { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 1, background: '#282828' }
          : { alignItems: 'center', justifyContent: 'center', background: '#ececec' }),
      }}
    >
      {(many ? images.slice(0, 4) : images).map((src, i) => (
        <span
          key={i}
          style={{
            background: '#ececec',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            width: '100%',
            height: '100%',
          }}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            style={{ maxWidth: '86%', maxHeight: '88%', objectFit: 'contain', display: 'block' }}
          />
        </span>
      ))}
    </div>
  );
}

function AssistantTurn({
  message,
  rating,
  onRate,
  onOpenMemory,
  onNotice,
  onOpenAttachment,
}: {
  message: ChatMessage;
  rating?: 'up' | 'down';
  onRate: (r: 'up' | 'down') => void;
  onOpenMemory: () => void;
  onNotice: (message: string) => void;
  onOpenAttachment?: (target: AttachmentTarget) => void;
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

      {/* What it put together or changed, under the sentence describing it - so
          the turn ends with the collection, not a promise about one.

          Full card, not the small inline row: that row is a **mention** of
          something a message is about, which is what a user bubble carries.
          This is the collection itself, handed over, so it is the same card the
          Saved tab and Discover show (Figma node 5555-52787). */}
      {message.attachment &&
        (message.attachment.target?.kind === 'collection' ? (
          <CollectionCard
            name={message.attachment.title}
            meta={message.attachment.subtitle ?? ''}
            images={message.attachment.images}
            onOpen={() => {
              const target = message.attachment?.target;
              if (target) onOpenAttachment?.(target);
            }}
          />
        ) : (
          <AttachmentCard attachment={message.attachment} onOpenAttachment={onOpenAttachment} />
        ))}

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
 * Carries the Data Memory glyph and a chevron, because tapping it opens the
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
