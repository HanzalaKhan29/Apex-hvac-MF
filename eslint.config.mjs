import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * eslint-config-next v16 ships native flat configs, so this imports them
 * directly rather than going through FlatCompat — which needed
 * @eslint/eslintrc as an extra dependency and only existed to translate the
 * old eslintrc format.
 *
 * core-web-vitals is the relevant preset here: J.1 sets LCP, INP and CLS
 * targets, and these are the lint rules that catch the code-level causes
 * (unoptimised <img>, sync scripts, missing next/font).
 */
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['.next/**', 'node_modules/**', 'scripts/**', 'public/**'],
  },
];

export default eslintConfig;
