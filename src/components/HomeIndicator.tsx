export default function HomeIndicator() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
      }}
    >
      <div
        style={{
          width: 134,
          height: 5,
          background: 'rgba(255,255,255,0.3)',
          borderRadius: 9999,
        }}
      />
    </div>
  );
}
