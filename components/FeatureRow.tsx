import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

/**
 * B.19 — <FeatureRow />
 *
 * Icon, title, description — used in the Why Apex section and in the body of
 * service, city, about and financing pages (§9.1, §5.7).
 *
 * RESPONSIVE (B.19, H.3.2): icon and text sit SIDE BY SIDE at every
 * breakpoint. The icon never moves above the text on mobile — that would break
 * the scanning rhythm of a short vertical list, which is the whole point of
 * the pattern.
 *
 * MOTION: none. Why Apex sits below the §4.11 entrance threshold on the
 * homepage, so this component has no entrance animation and no observer.
 */

export interface FeatureRowProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** e.g. the 0% Financing row links to /financing. */
  href?: string;
  ground?: 'ink' | 'paper';
  /**
   * Appendix Z class — B.19 requires the title to "render at the heading level
   * passed by the parent section so levels are never skipped", but B.19's prop
   * list does not carry one. Passing it explicitly is the only way to satisfy
   * the rule without inferring document position at runtime.
   */
  headingLevel?: 2 | 3 | 4;
}

export default function FeatureRow({
  icon: Icon,
  title,
  description,
  href,
  ground = 'paper',
  headingLevel = 3,
}: FeatureRowProps) {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  const titleTone = ground === 'ink' ? 'text-apex-paper' : 'text-apex-ink';
  const bodyTone = ground === 'ink' ? 'text-apex-paper/80' : 'text-n-700';
  const badgeTone = ground === 'ink' ? 'bg-apex-ink-2' : 'bg-n-100';

  const inner = (
    <>
      <span
        className={`inline-flex size-12 shrink-0 items-center justify-center rounded-lg ${badgeTone} transition-[background-color,rotate] duration-[var(--dur-hover)] ease-out group-hover:rotate-3 group-hover:bg-apex-copper`}
      >
        <Icon
          aria-hidden="true"
          strokeWidth={2}
          className={`size-6 ${ground === 'ink' ? 'text-apex-copper-dark' : 'text-apex-copper'} transition-colors duration-[var(--dur-hover)] ease-out group-hover:text-white`}
        />
      </span>
      <div className="min-w-0">
        <Heading className={`text-h4 ${titleTone}`}>{title}</Heading>
        <p className={`mt-s1 text-body measure-body ${bodyTone}`}>{description}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <li className="group">
        <Link href={href} className="flex items-start gap-s3">
          {inner}
        </Link>
      </li>
    );
  }

  // No `group`: without an href this row has nothing to click, so the icon
  // shouldn't invert on hover and imply otherwise (it did before this fix —
  // `group` was applied unconditionally, so hovering a purely informational
  // row still fired the link-style icon invert).
  return <li className="flex items-start gap-s3">{inner}</li>;
}
