type RatingStarsProps = {
  rating: number;
  size?: "sm" | "md" | "lg";
};

export default function RatingStars({
  rating,
  size = "md",
}: RatingStarsProps) {
  const safeRating = Math.max(0, Math.min(5, rating));

  const sizeClass =
    size === "sm"
      ? "h-4 w-4"
      : size === "lg"
        ? "h-7 w-7"
        : "h-5 w-5";

  let activeColor = "#ef4444";

  if (safeRating === 0) {
    activeColor = "#6b7280";
  } else if (safeRating >= 4.5) {
    activeColor = "#22c55e";
  } else if (safeRating >= 4) {
    activeColor = "#facc15";
  } else if (safeRating >= 3) {
    activeColor = "#f97316";
  }

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Рейтинг ${safeRating.toFixed(1)} из 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const fill = Math.max(
          0,
          Math.min(100, (safeRating - index) * 100)
        );

        const gradientId = `star-gradient-${index}`;

        return (
          <svg
            key={index}
            viewBox="0 0 24 24"
            className={sizeClass}
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset={`${fill}%`}
                  stopColor={activeColor}
                />

                <stop
                  offset={`${fill}%`}
                  stopColor="#6b7280"
                  stopOpacity="0.35"
                />
              </linearGradient>
            </defs>

            <path
              d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95L12 2.5z"
              fill={`url(#${gradientId})`}
            />
          </svg>
        );
      })}
    </div>
  );
}