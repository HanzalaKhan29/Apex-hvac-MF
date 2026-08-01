import PhoneLink from './PhoneLink';
import { EMERGENCY_LINE } from '@/lib/contact';

/**
 * B.2 — <Topbar />
 *
 * The thin --apex-ink bar above the header carrying the emergency-availability
 * line, the service-area list and a click-to-call number (§5.1).
 *
 * RESPONSIVE (B.2, H.1.1): lg+ ONLY. Below lg the component does not render
 * and --topbar-h resolves to 0. This is the same 1024px boundary as every
 * other chrome component; NO OTHER THRESHOLD EXISTS (§4.5).
 *
 * ACCESSIBILITY (B.2, I.10): contained inside the <header> landmark, before
 * the nav. At lg+ its <PhoneLink /> is the FIRST contact affordance in DOM
 * order, satisfying 3.2.6 Consistent Help. The status dot is aria-hidden; the
 * availability text is real text, not an image or a pseudo-element.
 *
 * The status dot is a CSS-only element with NO ANIMATION (B.2) — auto-playing
 * motion is barred by §6.2.
 */

export interface TopbarProps {
  cities: readonly string[];
}

export default function Topbar({ cities }: TopbarProps) {
  return (
    <div className="hidden bg-apex-ink text-apex-paper lg:block [--accent:var(--color-apex-copper-dark)]">
      <div className="container-max flex h-[var(--topbar-h)] items-center justify-between gap-s4 px-[var(--section-padding-inline)] text-small">
        <p className="flex items-center gap-s2">
          <span
            aria-hidden="true"
            className="inline-block size-2 rounded-full bg-emergency"
          />
          {EMERGENCY_LINE}
        </p>

        <div className="flex items-center gap-s4">
          <p className="text-apex-paper/70">{cities.join(' · ')}</p>
          <PhoneLink display="full" context="topbar" />
        </div>
      </div>
    </div>
  );
}
