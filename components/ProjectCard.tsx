import Image from 'next/image';

/**
 * B.22 — <ProjectCard />
 *
 * One completed-work image with a caption, used on /projects (§9.1).
 *
 * CONTENT CONSTRAINT (§9.4, A.9): the caption states INSTALLATION TYPE AND
 * CITY ONLY. Client names, addresses, job values and dates are CLIENT ACTION
 * REQUIRED and none is invented. All five current images are AI-generated
 * placeholders, launch-acceptable only as an explicitly temporary measure.
 *
 * Images are INFORMATIVE and carry descriptive alt text — "Technician
 * inspecting an attic air handler with a flashlight", not "HVAC" (§6.2, I.11).
 *
 * next/image with explicit width and height so no CLS occurs (§4.10, J.1).
 * Motion is applied to the image CONTAINER rather than the image itself, so no
 * reflow occurs (B.22).
 */

export interface ProjectCardProps {
  image: { src: string; alt: string; focalPoint: string };
  caption: string;
  installationType: string;
  city: string;
  /** Occupies the wide cell in the 2×3 grid. No effect below md (H.5.4). */
  wide?: boolean;
  priority?: boolean;
}

export default function ProjectCard({
  image,
  caption,
  installationType,
  city,
  wide,
  priority,
}: ProjectCardProps) {
  return (
    <li className={wide ? 'lg:col-span-2' : undefined}>
      <figure className="group h-full overflow-hidden rounded-xl border border-n-200 bg-white shadow-sm transition-shadow duration-[var(--dur-hover)] ease-out hover:shadow-md">
        <div
          className={[
            'relative overflow-hidden',
            // 4:3 standard, 16:9 for the wide cell at lg+ (H.5.4).
            wide ? 'aspect-[4/3] lg:aspect-[16/9]' : 'aspect-[4/3]',
          ].join(' ')}
        >
          <Image
            src={`/images/${image.src}`}
            alt={image.alt}
            fill
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            // J.3 — declared per usage so the browser never downloads a
            // desktop variant on a phone.
            sizes={
              wide
                ? '(min-width: 1024px) 66vw, (min-width: 768px) 100vw, 100vw'
                : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
            }
            // Per-image focal point rather than object-fit: cover's centre
            // default, which would crop the subject at one of the ratios
            // (§4.10, D.0).
            style={{ objectFit: 'cover', objectPosition: image.focalPoint }}
            className="transition-transform duration-[var(--dur-hover)] ease-out group-hover:scale-[1.02]"
          />
        </div>

        <figcaption className="flex flex-col gap-s1 p-s4">
          <span className="text-h4 text-apex-ink">{installationType}</span>
          <span className="text-small text-n-700">{caption}</span>
          <span className="text-micro font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
            {city}
          </span>
        </figcaption>
      </figure>
    </li>
  );
}
