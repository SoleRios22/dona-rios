export default function Logo({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 42 42">
      <circle cx="21" cy="21" r="20" fill="#FBF6EA" stroke="#5C7A3F" strokeWidth="2" />
      <ellipse cx="21" cy="20" rx="11" ry="13" fill="#5C7A3F" />
      <ellipse cx="21" cy="20" rx="7.5" ry="9.5" fill="#A9C17A" />
      <circle cx="21" cy="21" r="4.5" fill="#8B4A2B" />
    </svg>
  );
}
