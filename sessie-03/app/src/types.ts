// ArchiMate-model en validatie-types

export type Layer = 'business' | 'information' | 'application' | 'technology' | 'other'

export const LAYER_LABEL: Record<Layer, string> = {
  business: 'Businesslaag',
  information: 'Informatielaag',
  application: 'Applicatielaag',
  technology: 'Technologielaag',
  other: 'Overig',
}

export const LAYER_COLOR: Record<Layer, string> = {
  business: '#f6c453', // geel
  information: '#7ec4cf', // lichtblauw
  application: '#8fb8de', // blauw
  technology: '#9ed99e', // groen
  other: '#c4c4c4',
}

export interface AmElement {
  id: string
  type: string // bijv. BusinessProcess, ApplicationComponent
  name: string
  layer: Layer
  documentation: string
  properties: Record<string, string>
}

export interface AmRelation {
  id: string
  type: string // bijv. Serving, Realization, Access, Assignment
  source: string
  target: string
}

export interface AmModel {
  name: string
  elements: AmElement[]
  relations: AmRelation[]
  propertyDefinitions: Record<string, string> // id -> naam
}

export type Severity = 'error' | 'warning' | 'info'

export type FindingCategory =
  | 'laagovergang'
  | 'attribuut'
  | 'koppeling'
  | 'naamgeving'
  | 'archimate'

export interface Finding {
  id: string
  severity: Severity
  category: FindingCategory
  title: string
  detail: string
  layer: Layer
  elementName?: string
  rule: string // welke metamodel-regel
}

export const CATEGORY_LABEL: Record<FindingCategory, string> = {
  laagovergang: 'Laagovergang',
  attribuut: 'Verplicht attribuut',
  koppeling: 'Verplichte koppeling',
  naamgeving: 'Naamgeving & dubbelen',
  archimate: 'ArchiMate-relatieregel',
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  error: 'Fout',
  warning: 'Waarschuwing',
  info: 'Info',
}
