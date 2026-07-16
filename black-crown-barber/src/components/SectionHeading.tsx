type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
  center?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  light,
  center,
}: SectionHeadingProps) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      <p className="text-xs font-medium uppercase tracking-[0.35em] text-gold">
        {eyebrow}
      </p>
      <h2
        className={`mt-4 font-display text-3xl sm:text-4xl md:text-[2.75rem] ${
          light ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-balance text-base ${
            light ? "text-cream/75" : "text-ink/70"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
