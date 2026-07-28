import { useState } from 'react';

/**
 * The prompt field. Used by the Chat tab ("Your instruction..") and by Manage
 * Memory ("Ask to add or update", which hides the attach button). A leading "+"
 * (attach) and a trailing mic; the mic turns into a send arrow once there's text.
 */
export default function ChatBar({
  placeholder = 'Ask VIP.ai anything',
  onSend,
  showAttach = true,
  disabled = false,
}: {
  placeholder?: string;
  onSend?: (text: string) => void;
  /** Manage Memory drops the attach button - there is nothing to attach there. */
  showAttach?: boolean;
  /** Greys the field out, e.g. while memory is switched off. */
  disabled?: boolean;
}) {
  const [text, setText] = useState('');
  const send = () => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend?.(value);
    setText('');
  };
  const hasText = text.trim().length > 0 && !disabled;
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
          disabled={disabled}
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            background: 'none',
            border: 'none',
            outline: 'none',
            color: disabled ? '#6b6b6b' : '#f2f2f2',
            fontSize: 15,
            fontWeight: 400,
          }}
        />
        {showAttach && (
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
        )}
        <button
          onClick={send}
          disabled={disabled}
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
