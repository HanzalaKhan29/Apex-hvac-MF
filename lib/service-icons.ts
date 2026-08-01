import {
  Building2,
  CalendarCheck,
  Flame,
  Replace,
  Wind,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { ServiceSlug } from './services';

/**
 * §4.9 / E.3 — the icon system.
 *
 * Lucide, decided rather than left as an either/or with Phosphor: its default
 * 24×24 grid and default 2px round-cap stroke match the specification with
 * zero per-icon overrides, and it is tree-shakeable per icon, which matters
 * directly against the §6.3 performance budget.
 *
 * PER-ICON NAMED IMPORTS ONLY — never the barrel import, which defeats
 * tree-shaking (E.3, J.4).
 *
 * Kept separate from lib/services.ts so the Server Action can validate the
 * service enum without pulling UI into its bundle.
 */
export const SERVICE_ICONS: Record<ServiceSlug, LucideIcon> = {
  'ac-repair': Wrench,
  'ac-replacement-installation': Replace,
  'heating-furnace-repair': Flame,
  'commercial-hvac': Building2,
  'maintenance-plans': CalendarCheck,
  'indoor-air-quality': Wind,
};
