type SignalMarkProps = {
  size?: number;
  className?: string;
};

export function SignalMark({ size = 56, className }: SignalMarkProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        transform: "rotate(45deg)",
        overflow: "hidden",
        border: "2px solid var(--color-ember-bright)",
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-paper)",
      }}
    >
      <img
        src="/Assets/logo.png"
        alt="Kaluana Logo"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          objectFit: "contain",
          transform: "rotate(-45deg)",
        }}
      />
    </div>
  );
}
