import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * B.14 — <Button />
 *
 * The single implementation of §4.6's button system, so min-height, focus ring
 * and hover behaviour are GUARANTEED rather than reapplied per usage.
 *
 * min-height: 48px is non-negotiable given 70–78% mobile traffic and exceeds
 * the 24×24 normative minimum deliberately (§6.2's 2.5.8 row, I.7).
 *
 * The :focus-visible ring comes from the base layer and applies on both light
 * and ink grounds — focus rings are the sole exception to §4.2's contextual
 * accent rule, since at 3px the ring is a non-text element governed by the 3:1
 * threshold, which --apex-copper clears on ink at 3.62:1 (I.3).
 *
 * Disabled buttons are NOT used for pending states; `aria-busy` is used
 * instead so the control stays focusable (B.14, G.2).
 */

export interface ButtonProps {
  variant: 'primary' | 'ink' | 'ghost' | 'outline-light';
  size?: 'md' | 'lg';
  href?: string;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
  disabled?: boolean;
  busy?: boolean;
  children: ReactNode;
  /** Permitted for grid placement only (B.14). */
  className?: string;
}

const VARIANT = {
  // Filled --apex-copper, white text (5.08:1 measured).
  primary:
    'bg-apex-copper text-white hover:bg-apex-copper-hover border border-transparent',
  // Filled --apex-ink, white text — secondary actions on light grounds.
  ink: 'bg-apex-ink text-white hover:bg-apex-ink-2 border border-transparent',
  // Transparent, 1.5px rgba(255,255,255,.35) border, fills on hover —
  // tertiary actions on dark hero grounds.
  ghost:
    'bg-transparent text-white border-[1.5px] border-white/35 hover:bg-white/10',
  // Transparent, --n-200 border, --apex-ink text — tertiary on light grounds.
  'outline-light':
    'bg-transparent text-apex-ink border-[1.5px] border-n-200 hover:bg-n-100',
} as const;

const SIZE = {
  md: 'min-h-12 px-s4 py-s3', // 48px floor
  lg: 'min-h-14 px-[34px] py-[18px]', // 56px, hero-scale CTAs
} as const;

export default function Button({
  variant,
  size = 'md',
  href,
  type = 'button',
  fullWidth,
  disabled,
  busy,
  children,
  className,
}: ButtonProps) {
  const classes = [
    'inline-flex items-center justify-center gap-s2 text-center',
    'font-geist font-bold text-body rounded-md',
    // 2px lift plus the background-color swap to each variant's `-hover`
    // token already IS the "brighten" — copper-hover/ink-2 are lighter than
    // their resting shade, so no separate brightness filter is layered on
    // top. NO SCALE TRANSFORM — restrained, no bouncy effects (§4.11, B.14).
    'transition-[background-color,translate,border-color] duration-[var(--dur-button)] ease-out',
    'hover:-translate-y-0.5',
    'disabled:opacity-60 disabled:pointer-events-none',
    VARIANT[variant],
    SIZE[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    const external = href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('#');
    if (external) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      aria-busy={busy || undefined}
    >
      {children}
    </button>
  );
}
