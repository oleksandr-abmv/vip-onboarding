import { useState } from 'react';

/**
 * "Ask VIP.ai" chat input. On Discover it sits directly above the tab bar as one
 * combined dock; on the Product Page it's pinned on its own (context placeholder).
 * A leading "+" (attach) and a trailing mic; the mic turns into a send arrow once
 * there's text. Prototype: send is a no-op that clears the field.
 */
export default function ChatBar({
  placeholder = 'Ask VIP.ai anything',
  onSend,
}: {
  placeholder?: string;
  onSend?: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const send = () => {
    const value = text.trim();
    if (!value) return;
    onSend?.(value);
    setText('');
  };
  const hasText = text.trim().length > 0;
  return (
    <div style={{ flexShrink: 0, background: 'transparent', padding: '8px 16px 10px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          height: 50,
          borderRadius: 100,
          background: '#161616',
          border: '1px solid #282828',
          padding: '0 6px 0 16px',
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          placeholder={placeholder}
          aria-label={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#f2f2f2',
            fontSize: 15,
            fontWeight: 400,
          }}
        />
        <button
          aria-label="Add attachment"
          style={{
            width: 34,
            height: 34,
            borderRadius: 100,
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 24, color: '#9a9a9a' }} aria-hidden>
            add
          </span>
        </button>
        <button
          onClick={send}
          aria-label={hasText ? 'Send' : 'Voice input'}
          style={{
            width: 38,
            height: 38,
            borderRadius: 100,
            background: hasText ? '#f6f6f6' : '#242424',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background 160ms ease',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{
              fontSize: 20,
              color: hasText ? '#121212' : '#cfcfcf',
              fontVariationSettings: "'wght' 500",
            }}
            aria-hidden
          >
            {hasText ? 'arrow_upward' : 'mic'}
          </span>
        </button>
      </div>
    </div>
  );
}
