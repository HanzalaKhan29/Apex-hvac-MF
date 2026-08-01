import { Quote, Star } from 'lucide-react';

/**
 * B.20 — <ReviewCard />
 *
 * A single review, in one of two MUTUALLY EXCLUSIVE attribution modes (§5.10).
 * The mode is not optional.
 *
 * DEMO / PRE-LAUNCH (current). Neutral quotation treatment. NO Google "G", NO
 * star row, NO verified badge. Attribution is initials plus city. Each card
 * carries a visible in-card label reading "Illustrative — replaced with real
 * Google reviews at launch." The label sits INSIDE the card, never as a
 * page-level footnote.
 *
 * Why this matters (§5.10): the demo is itself the portfolio artifact a
 * prospective client will screenshot. Rendering fabricated testimonials inside
 * Google-branded, "verified"-badged cards is the opposite of the intended
 * trust signal, and Google's brand-permission terms restrict the G mark to
 * genuine Google content.
 *
 * LIVE (post-launch). The G, star row, relative date and verified badge are
 * enabled ONLY when content is pulled from the Google Business Profile via the
 * Places API or an authorized widget. Never hand-transcribed.
 */

export interface ReviewCardProps {
  mode: 'demo' | 'live';
  quote: string;
  /** demo: 'M.R., Chandler' — initials plus city. */
  attribution: string;
  serviceTag: string;
  /** live mode only. */
  rating?: number;
  /** live mode only. */
  relativeDate?: string;
}

export default function ReviewCard({
  mode,
  quote,
  attribution,
  serviceTag,
  rating,
  relativeDate,
}: ReviewCardProps) {
  return (
    <li className="flex">
      {/*
       * B.20: "Visual. Standard card treatment per §4.7." §4.7 itself reads
       * "box-shadow: var(--shadow-sm) at rest, var(--shadow-md) on hover" —
       * this was previously missing here even though the rule already applied
       * to it. focus-within gives keyboard users the same affordance a mouse
       * user gets, matching <ServiceCard />'s pattern (§6.1 item 5). CSS-only,
       * no animation library — J.4.
       */}
      <figure className="group flex w-full flex-col rounded-xl border border-n-200 bg-white p-s4 shadow-sm transition-[box-shadow,translate] duration-[var(--dur-hover)] ease-out hover:-translate-y-1 hover:shadow-md focus-within:-translate-y-1 focus-within:shadow-md md:p-s5">
        {/* Category tag — a pill at --r-sm, one step below the card's --r-xl. */}
        <div className="flex items-center justify-between gap-s3">
          <span className="inline-flex rounded-sm bg-n-100 px-s2 py-s1 text-micro font-semibold text-n-700">
            {serviceTag}
          </span>

          {mode === 'live' && typeof rating === 'number' ? (
            <>
              {/* The star row is aria-hidden and the numeric rating is exposed
                  as text, so a screen reader hears "4 out of 5" rather than
                  five icon names (B.20, I.4). */}
              <span aria-hidden="true" className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    strokeWidth={2}
                    className={
                      i < Math.round(rating)
                        ? 'size-4 fill-apex-copper text-apex-copper'
                        : 'size-4 text-n-200'
                    }
                  />
                ))}
              </span>
              <span className="visually-hidden">{rating} out of 5</span>
            </>
          ) : (
            <Quote aria-hidden="true" strokeWidth={2} className="size-5 text-n-200" />
          )}
        </div>

        <blockquote className="mt-s3 grow text-body measure-body text-n-950">
          {quote}
        </blockquote>

        <figcaption className="mt-s4 flex flex-col gap-s1 border-t border-n-200 pt-s3">
          <cite className="not-italic text-small font-semibold text-apex-ink">
            {attribution}
          </cite>
          {mode === 'live' && relativeDate ? (
            <span className="text-micro text-n-700">{relativeDate}</span>
          ) : null}

          {mode === 'demo' ? (
            /* Real text inside the card, never a tooltip or title attribute
               (I.5). It wraps rather than truncating at every width — it is
               the disclosure, not a caption (H.2.8). */
            <span className="text-micro text-n-700">
              Illustrative — replaced with real Google reviews at launch.
            </span>
          ) : null}
        </figcaption>
      </figure>
    </li>
  );
}
