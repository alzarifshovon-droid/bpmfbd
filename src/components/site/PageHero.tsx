export function PageHero({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <section className="gradient-brand">
      <div className="container-page py-14">
        {eyebrow && (
          <p className="text-xs font-bold tracking-[0.2em] text-primary-foreground/80 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 text-3xl font-bold text-primary-foreground sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-sm text-primary-foreground/85 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
