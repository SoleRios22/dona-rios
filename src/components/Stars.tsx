export default function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = rating >= n ? 1 : rating >= n - 0.5 ? 0.5 : 0;
        return (
          <svg key={n} width={size} height={size} viewBox="0 0 20 20">
            <defs>
              <linearGradient id={`star-${n}-${size}`}>
                <stop offset={`${fill * 100}%`} stopColor="#C8973C" />
                <stop offset={`${fill * 100}%`} stopColor="#E5DCC3" />
              </linearGradient>
            </defs>
            <path
              fill={`url(#star-${n}-${size})`}
              d="M10 1l2.6 5.8 6.3.6-4.8 4.2 1.4 6.3L10 14.9 4.5 17.9l1.4-6.3L1.1 7.4l6.3-.6z"
            />
          </svg>
        );
      })}
    </div>
  );
}
