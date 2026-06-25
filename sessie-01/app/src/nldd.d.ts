// Laat TypeScript de <nldd-*> web components toe in JSX.
// De NLDD-componenten zijn web components, geen React-componenten, dus we
// vertellen de JSX-typecheck dat onbekende custom elements (met willekeurige
// attributen en events) zijn toegestaan.
import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Side-effect imports zonder eigen type-declaraties.
declare module '@nldd/design-system/styles';
