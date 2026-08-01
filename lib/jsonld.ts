/**
 * Serialises a JSON-LD graph for injection into a <script> tag.
 *
 * JSON.stringify does not escape "<", so any string reaching the graph that
 * contained "</script>" would close the tag early and turn structured data
 * into an HTML injection point. Nothing user-supplied reaches this graph today
 * (it is built from typed modules in lib/), but the escape costs nothing and
 * removes the whole class of failure if that ever changes. OWASP A03.
 */
export function serialiseJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\u003c')
    .replace(/>/g, '\u003e')
    .replace(/&/g, '\u0026');
}
