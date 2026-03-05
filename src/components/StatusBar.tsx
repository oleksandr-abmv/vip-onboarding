export default function StatusBar() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 54,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 10,
        zIndex: 20,
      }}
    >
      <span
        style={{
          color: 'white',
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: -0.41,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        9:41
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Signal bars */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="3" width="3" height="9" rx="1" fill="white" />
          <rect x="5" y="2" width="3" height="10" rx="1" fill="white" />
          <rect x="10" y="1" width="3" height="11" rx="1" fill="white" />
          <rect x="15" y="0" width="3" height="12" rx="1" fill="white" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path
            d="M8 3.6C9.8 3.6 11.4 4.3 12.6 5.4L14.1 3.9C12.5 2.3 10.4 1.4 8 1.4C5.6 1.4 3.5 2.3 1.9 3.9L3.4 5.4C4.6 4.3 6.2 3.6 8 3.6Z"
            fill="white"
          />
          <path
            d="M8 7.2C9 7.2 9.9 7.6 10.6 8.2L12 6.8C10.9 5.8 9.5 5.2 8 5.2C6.5 5.2 5.1 5.8 4 6.8L5.4 8.2C6.1 7.6 7 7.2 8 7.2Z"
            fill="white"
          />
          <circle cx="8" cy="10.5" r="1.5" fill="white" />
        </svg>
        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <div
            style={{
              width: 22,
              height: 11,
              borderRadius: 2.5,
              border: '1px solid rgba(255,255,255,0.35)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              padding: '0 1.5px',
            }}
          >
            <div
              style={{
                height: 7,
                width: 14,
                background: 'white',
                borderRadius: 1,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
