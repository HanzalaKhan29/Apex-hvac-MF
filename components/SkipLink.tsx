/**
 * B.9 — <SkipLink />
 *
 * "Skip to main content", visually hidden until focused (§6.2).
 * FIRST focusable element in the DOM on every route (A.0.1 item 1).
 *
 * The .skip-link utility clips rather than using `display: none`, which would
 * remove it from the tab order. On focus it becomes visible at the top-left,
 * above all chrome at --z-modal, with the standard 3px --apex-copper ring from
 * the base layer. Target is <main id="main" tabindex="-1"> so focus actually
 * lands (B.9, I.2).
 */

export interface SkipLinkProps {
  targetId?: string;
}

export default function SkipLink({ targetId = 'main' }: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className="skip-link">
      Skip to main content
    </a>
  );
}
