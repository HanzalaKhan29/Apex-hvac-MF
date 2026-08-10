/**
 * Completed-work photography, used on /projects (full set) and, as of Z.37,
 * a three-card teaser on the homepage.
 *
 * Moved out of app/[locale]/(indexed)/projects/page.tsx into its own lib file
 * (Z.37) — matching lib/services.ts and lib/cities.ts's existing pattern of
 * one pure-data file per content domain, per the "single message catalogue"
 * rule (lib/content.ts's own header) — so the homepage teaser reads the same
 * captions rather than a second, driftable copy of them.
 *
 * CONTENT CONSTRAINT (§9.4, A.9), unchanged from the original location:
 * captions state INSTALLATION TYPE AND CITY ONLY. No client names, addresses,
 * job values or dates — none is invented.
 *
 * PHOTOGRAPHY STATUS (A.9): all five images are AI-generated placeholders,
 * launch-acceptable only as an explicitly temporary measure.
 */

export interface Project {
  readonly image: { src: string; alt: string; focalPoint: string };
  readonly installationType: string;
  readonly caption: string;
  readonly city: string;
  /** Occupies the wide cell in /projects's 2×3 grid. No effect on the
   *  homepage teaser, which never uses `wide` (H.5.4). */
  readonly wide?: boolean;
  readonly priority?: boolean;
}

export const PROJECTS: readonly Project[] = [
  {
    image: {
      src: 'project-attic-air-handler.jpg',
      alt: 'Technician inspecting a newly installed attic air handler with insulated duct runs',
      focalPoint: '55% 50%',
    },
    installationType: 'Attic air handler replacement',
    caption: 'New air handler with re-sealed plenum and insulated duct runs.',
    city: 'Mesa',
    wide: true,
    priority: true,
  },
  {
    image: {
      src: 'project-commercial-rooftop.jpg',
      alt: 'Completed commercial rooftop packaged unit on a steel curb with conduit runs',
      focalPoint: '50% 55%',
    },
    installationType: 'Commercial rooftop packaged unit',
    caption: 'RTU set on a new steel curb with re-run conduit and condensate.',
    city: 'Phoenix',
  },
  {
    image: {
      src: 'project-mechanical-room.jpg',
      alt: 'Finished mechanical room with sheet-metal trunk lines and a commercial air handler',
      focalPoint: '50% 55%',
    },
    installationType: 'Commercial mechanical room',
    caption: 'Air handler and sheet-metal trunk lines after a full re-fit.',
    city: 'Tempe',
  },
  {
    image: {
      src: 'project-residential-mechanical.jpg',
      alt: 'Residential mechanical room with a high-efficiency furnace, humidifier and copper line set',
      focalPoint: '45% 55%',
    },
    installationType: 'Residential mechanical room',
    caption: 'High-efficiency furnace with a new copper line set and drain.',
    city: 'Chandler',
  },
  {
    image: {
      src: 'project-condenser-pad.jpg',
      alt: 'New outdoor condenser unit on a level concrete pad beside a desert-landscaped home',
      focalPoint: '55% 60%',
    },
    installationType: 'Outdoor condenser replacement',
    caption: 'New condenser set level on a poured pad with a service disconnect.',
    city: 'Scottsdale',
  },
] as const;
