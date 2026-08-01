import { ChevronDown, CircleAlert } from 'lucide-react';

/**
 * B.13 — <FormField />
 *
 * The shared input, select, textarea, label and error primitive (§4.8, §9.1).
 *
 * Visual (§4.8, C.2's control-boundary rule): border is --n-400, NOT --n-200.
 * An input is a user interface component and its boundary is governed by the
 * 3:1 non-text threshold; --n-200 is a decorative divider value and does not
 * clear it. Cards and dividers keep --n-200 — a card is not a control.
 *
 * Accessibility (B.13, G.6, I.9):
 *   - Label is a real <label for>, never aria-label alone, always visible
 *     above the field. Never placeholder-as-label.
 *   - Error text is associated via aria-describedby, not merely visually
 *     adjacent, and the container carries role="alert".
 *   - Mobile input types are mandatory: type="tel" for phone (numeric keypad),
 *     inputmode="numeric" with maxlength="5" for zip, native <select> for the
 *     dropdowns — no custom listbox (§6.1 item 3).
 */

export type FieldKind = 'text' | 'tel' | 'select' | 'textarea';

export interface FormFieldProps {
  kind: FieldKind;
  name: string;
  label: string;
  required?: boolean;
  options?: readonly { value: string; label: string }[];
  inputMode?: 'numeric' | 'tel';
  maxLength?: number;
  error?: string;
  defaultValue?: string;
  /** Marks the field as readonly during submission — never disabled (G.2). */
  readOnly?: boolean;
  /**
   * Autofill token. Mobile is 70-78% of this traffic (§1.4), so autofill is
   * not a nicety: it removes most of the typing from the primary conversion
   * form. Every additional field costs ~10% of submissions, and a field the
   * browser fills costs far less than one the user types.
   */
  autoComplete?: string;
  /** Off for codes and numbers, where red squiggles are noise. */
  spellCheck?: boolean;
}

/* Field height and padding are constant at every breakpoint so the card's
   height does not shift between them (B.11, B.13). */
const CONTROL = [
  'w-full min-h-12 px-s3 py-[14px] rounded-md',
  'border-[1.5px] border-n-400 bg-apex-paper text-n-950',
  'shadow-xs',
  'placeholder:text-n-400',
  // Focus: border → copper, ground → white, no harsh outline. The 3px
  // focus-visible ring from the base layer supplies the visible indicator.
  'focus:border-apex-copper focus:bg-white',
  'transition-colors duration-[var(--dur-hover)] ease-out',
  // No height or padding animation, which would shift layout (B.13).
  'read-only:bg-n-50',
].join(' ');

const ERROR_CONTROL = 'border-danger';

export default function FormField({
  kind,
  name,
  label,
  required,
  options,
  inputMode,
  maxLength,
  error,
  defaultValue,
  readOnly,
  autoComplete,
  spellCheck,
}: FormFieldProps) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;

  const controlClass = [CONTROL, error ? ERROR_CONTROL : ''].filter(Boolean).join(' ');

  const shared = {
    id,
    name,
    required,
    readOnly,
    defaultValue,
    autoComplete,
    spellCheck,
    'aria-required': required || undefined,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? errorId : undefined,
  };

  return (
    <div className="flex flex-col gap-s1">
      <label htmlFor={id} className="text-small font-semibold text-n-700">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-[var(--accent)]">
            {' '}
            *
          </span>
        ) : null}
      </label>

      {kind === 'select' ? (
        /* Styled to match text inputs exactly, with a custom chevron rather
           than the browser default (§4.8). Still a NATIVE <select> (§6.1). */
        <div className="relative">
          <select
            {...shared}
            disabled={readOnly}
            className={`${controlClass} appearance-none pr-10`}
          >
            {options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            strokeWidth={2}
            className="pointer-events-none absolute right-s3 top-1/2 size-5 -translate-y-1/2 text-n-700"
          />
        </div>
      ) : kind === 'textarea' ? (
        <textarea {...shared} maxLength={maxLength} rows={4} className={controlClass} />
      ) : (
        <input
          {...shared}
          type={kind === 'tel' ? 'tel' : 'text'}
          inputMode={inputMode}
          maxLength={maxLength}
          className={controlClass}
        />
      )}

      {error ? (
        <p id={errorId} role="alert" className="flex items-center gap-s1 text-micro text-danger">
          <CircleAlert aria-hidden="true" strokeWidth={2} className="size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
