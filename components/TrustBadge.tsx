import type { LucideIcon } from 'lucide-react';

/**
 * B.16 — <TrustBadge />
 *
 * The small icon-plus-text unit used in the hero trust row, service-page and
 * city-page trust rows (§9.1).
 *
 * PLACEHOLDER RULE (§9.4, A.0.5, B.16): where `numeric` is null the badge
 * renders NOTHING AT ALL rather than an em-dash — a trust row is the wrong
 * place for a visible gap. This is how §9.4's rating rules are enforced
 * mechanically: if review volume is under 50 the count entry is null and
 * disappears; if the rating is under 4.5 the whole rating badge is null and
 * disappears, and the row falls back to the remaining signals.
 *
 * The badge is content, not a control — not a link, not focusable. Icons are
 * aria-hidden; the label carries the meaning (I.5).
 */

export interface TrustBadgeProps {
  icon: LucideIcon;
  label: string;
  /** null → this entry is a §9.4 placeholder and the badge does not render. */
  numeric?: string | null;
  ground?: 'ink' | 'paper';
}

export default function TrustBadge({
  icon: Icon,
  label,
  numeric,
  ground = 'paper',
}: TrustBadgeProps) {
  // Distinguish "no numeric slot on this badge" from "numeric gated to null".
  if (numeric === null) return null;

  const tone = ground === 'ink' ? 'text-apex-paper' : 'text-n-950';

  return (
    <li className={`flex items-center gap-s2 ${tone}`}>
      <Icon
        aria-hidden="true"
        className="size-5 shrink-0 text-[var(--accent)]"
        strokeWidth={2}
      />
      <span className="text-small font-medium">
        {numeric ? <span className="num">{numeric}</span> : null}
        {numeric ? ' ' : null}
        {label}
      </span>
    </li>
  );
}
