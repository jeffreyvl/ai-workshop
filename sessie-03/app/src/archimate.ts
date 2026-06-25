import type { AmModel, AmElement, AmRelation, Layer } from './types'
import { LAYER_ASSIGNMENT } from './metamodel'

// Parser voor het Open Group "ArchiMate Model Exchange File Format" (XML).
// Werkt volledig in de browser via DOMParser — geen backend nodig.
// Namespace-veilig: we lopen de boom af op `localName` i.p.v. CSS-selectors,
// zodat het werkt ongeacht de gebruikte XML-namespace/prefix.

function layerForType(type: string): Layer {
  return LAYER_ASSIGNMENT[type] ?? 'other'
}

function localType(el: Element): string {
  const t =
    el.getAttribute('xsi:type') ||
    el.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance', 'type') ||
    ''
  return t.includes(':') ? t.split(':').pop()! : t
}

// Directe kinderen met een bepaalde localName
function children(parent: Element, name: string): Element[] {
  return Array.from(parent.children).filter((c) => c.localName === name)
}
// Eerste afstammeling (eender welke diepte) met localName
function firstByName(parent: Element, name: string): Element | undefined {
  return children(parent, name)[0]
}
function textOf(parent: Element, tag: string): string {
  return firstByName(parent, tag)?.textContent?.trim() ?? ''
}

export function parseArchimate(xml: string): AmModel {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error('Ongeldige XML: ' + parseError.textContent?.slice(0, 200))
  }

  const root = doc.documentElement
  if (!root || root.localName !== 'model') {
    throw new Error(
      'Dit lijkt geen ArchiMate Exchange-bestand (verwacht een <model> element bovenaan).'
    )
  }

  // Property-definities: id -> naam (bijv. propid-1 -> "Eigenaar")
  const propertyDefinitions: Record<string, string> = {}
  const pdContainer = firstByName(root, 'propertyDefinitions')
  if (pdContainer) {
    children(pdContainer, 'propertyDefinition').forEach((pd) => {
      const id = pd.getAttribute('identifier') || ''
      propertyDefinitions[id] = textOf(pd, 'name')
    })
  }

  function readProperties(parent: Element): Record<string, string> {
    const out: Record<string, string> = {}
    const container = firstByName(parent, 'properties')
    if (!container) return out
    children(container, 'property').forEach((p) => {
      const ref = p.getAttribute('propertyDefinitionRef') || ''
      const naam = propertyDefinitions[ref] || ref
      out[naam] = textOf(p, 'value')
    })
    return out
  }

  const elements: AmElement[] = []
  const elContainer = firstByName(root, 'elements')
  if (elContainer) {
    children(elContainer, 'element').forEach((el) => {
      const type = localType(el)
      elements.push({
        id: el.getAttribute('identifier') || '',
        type,
        name: textOf(el, 'name'),
        layer: layerForType(type),
        documentation: textOf(el, 'documentation'),
        properties: readProperties(el),
      })
    })
  }

  const relations: AmRelation[] = []
  const relContainer = firstByName(root, 'relationships')
  if (relContainer) {
    children(relContainer, 'relationship').forEach((rel) => {
      relations.push({
        id: rel.getAttribute('identifier') || '',
        type: localType(rel),
        source: rel.getAttribute('source') || '',
        target: rel.getAttribute('target') || '',
      })
    })
  }

  const modelName = textOf(root, 'name') || 'Architectuurmodel'

  return { name: modelName, elements, relations, propertyDefinitions }
}
