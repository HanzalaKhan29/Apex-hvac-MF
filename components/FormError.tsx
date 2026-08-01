import { PHONE_TOKEN } from '@/lib/form-messages';
import PhoneLink from './PhoneLink';

/**
 * G.2 — the submission-level error, rendered ABOVE the submit button.
 *
 * Renders the message the SERVER actually returned, rather than one hardcoded
 * string. The action has four distinct failure branches — time floor, Turnstile,
 * rate limit, transport — and each carries its own instruction. Telling a
 * rate-limited user "we couldn't send that" points them at the wrong remedy;
 * the rate-limit message tells them to call instead, which is the one that
 * actually saves the lead.
 *
 * Where the message carries the {phone} token it is split and a real
 * <PhoneLink /> is dropped into the gap, so the number is a LIVE tel: link and
 * still renders through the single component §9.1 requires. A form failure
 * never becomes a dead end.
 */
export default function FormError({ message }: { message: string }) {
  const parts = message.split(PHONE_TOKEN);

  return (
    <p role="alert" className="text-small text-danger">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 ? (
            <PhoneLink display="label-only" context="form-error" />
          ) : null}
        </span>
      ))}
    </p>
  );
}
