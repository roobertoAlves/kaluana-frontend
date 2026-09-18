type SignalMarkProps = {
  size?: number;
  active?: boolean;
  className?: string;
};

export function SignalMark({
  size = 20,
  active = true,
  className,
}: SignalMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        transform="rotate(45 12 12)"
        fill={active ? "var(--accent)" : "none"}
        stroke="var(--accent)"
        strokeWidth="2"
      />
      {active && <circle cx="12" cy="12" r="2.5" fill="var(--bg-surface)" />}
    </svg>
  );
}
