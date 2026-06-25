import type { Layer } from './types'

// ─────────────────────────────────────────────────────────────────────────
// HET METAMODEL — pas dit bestand aan om de validatieregels te wijzigen.
// Dit is de "combinatie": standaard ArchiMate-relatieregels (zie validate.ts)
// PLUS de eigen metamodel-regels hieronder.
// ─────────────────────────────────────────────────────────────────────────

// 1. Laagindeling: welk ArchiMate-elementtype hoort bij welke laag.
//    De informatielaag wordt apart onderkend (passieve data-elementen).
export const LAYER_ASSIGNMENT: Record<string, Layer> = {
  // Businesslaag
  BusinessActor: 'business',
  BusinessRole: 'business',
  BusinessCollaboration: 'business',
  BusinessInterface: 'business',
  BusinessProcess: 'business',
  BusinessFunction: 'business',
  BusinessInteraction: 'business',
  BusinessEvent: 'business',
  BusinessService: 'business',
  Product: 'business',
  Contract: 'business',
  // Informatielaag (passieve structuur / data)
  BusinessObject: 'information',
  DataObject: 'information',
  Representation: 'information',
  Meaning: 'information',
  Value: 'information',
  // Applicatielaag
  ApplicationComponent: 'application',
  ApplicationCollaboration: 'application',
  ApplicationInterface: 'application',
  ApplicationFunction: 'application',
  ApplicationInteraction: 'application',
  ApplicationProcess: 'application',
  ApplicationEvent: 'application',
  ApplicationService: 'application',
  // Technologielaag
  Node: 'technology',
  Device: 'technology',
  SystemSoftware: 'technology',
  TechnologyCollaboration: 'technology',
  TechnologyInterface: 'technology',
  Path: 'technology',
  CommunicationNetwork: 'technology',
  TechnologyFunction: 'technology',
  TechnologyProcess: 'technology',
  TechnologyInteraction: 'technology',
  TechnologyEvent: 'technology',
  TechnologyService: 'technology',
  Artifact: 'technology',
}

// 2. Toegestane laagovergangen voor relaties (bron-laag → doel-laag).
//    Relaties BINNEN een laag mogen altijd. Alleen relaties hierin opgesomd
//    mogen tussen verschillende lagen lopen; al het andere is een afwijking.
//    Principe: een laag bedient/realiseert de laag erboven, niet andersom,
//    en technologie praat niet rechtstreeks met de businesslaag.
export const ALLOWED_LAYER_TRANSITIONS: Array<[Layer, Layer]> = [
  ['information', 'business'],
  ['business', 'information'],
  ['information', 'application'],
  ['application', 'information'],
  ['application', 'business'],
  ['technology', 'application'],
  ['technology', 'information'],
]

// 3. Verplichte attributen (properties) per laag.
//    Elk element in deze laag moet deze properties hebben met een waarde.
export const REQUIRED_PROPERTIES: Partial<Record<Layer, string[]>> = {
  business: ['Eigenaar'],
  information: ['Eigenaar'],
  application: ['Eigenaar', 'Status'],
  technology: ['Eigenaar'],
}

// Elk element van deze typen moet een documentatie/beschrijving hebben.
export const REQUIRE_DOCUMENTATION_FOR_LAYERS: Layer[] = ['business', 'application']

// 4. Verplichte koppelingen: elk element van `elementType` moet minstens één
//    relatie hebben (in willekeurige richting) naar een element in `toLayer`.
export interface RequiredLinkRule {
  elementType: string
  toLayer: Layer
  uitleg: string
}
export const REQUIRED_LINKS: RequiredLinkRule[] = [
  {
    elementType: 'ApplicationComponent',
    toLayer: 'technology',
    uitleg: 'Elke applicatiecomponent moet ontplooid zijn op de technologielaag (bijv. een server of systeemsoftware).',
  },
  {
    elementType: 'BusinessProcess',
    toLayer: 'application',
    uitleg: 'Elk bedrijfsproces moet door minstens één applicatie ondersteund worden.',
  },
  {
    elementType: 'ApplicationComponent',
    toLayer: 'information',
    uitleg: 'Elke applicatiecomponent moet minstens één gegevensobject benaderen (informatielaag).',
  },
]

// 5. Naamgeving & dubbelen.
//    Naamconventie: begint met hoofdletter, geen rare tekens (eenvoudige regel).
export const NAME_PATTERN = /^[A-Z0-9].{1,}$/
export const NAME_PATTERN_UITLEG =
  'Naam moet beginnen met een hoofdletter of cijfer en minstens 2 tekens lang zijn.'

// Een element zonder enkele relatie is een "wees" (mogelijk overbodig of vergeten).
export const FLAG_ORPHANS = true
