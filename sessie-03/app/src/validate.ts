import type { AmModel, AmElement, AmRelation, Finding, Layer } from './types'
import {
  ALLOWED_LAYER_TRANSITIONS,
  REQUIRED_PROPERTIES,
  REQUIRE_DOCUMENTATION_FOR_LAYERS,
  REQUIRED_LINKS,
  NAME_PATTERN,
  NAME_PATTERN_UITLEG,
  FLAG_ORPHANS,
} from './metamodel'

// ── Standaard ArchiMate-relatieregels (curated subset) ────────────────────
// Passieve structuur-elementen: alleen deze mogen het doel zijn van een Access.
const PASSIVE_TYPES = new Set([
  'BusinessObject',
  'DataObject',
  'Representation',
  'Artifact',
  'Meaning',
  'Value',
])

let counter = 0
function nf(f: Omit<Finding, 'id'>): Finding {
  return { id: `f${++counter}`, ...f }
}

export function validate(model: AmModel): Finding[] {
  counter = 0
  const findings: Finding[] = []
  const byId = new Map<string, AmElement>()
  model.elements.forEach((e) => byId.set(e.id, e))

  const nameOf = (id: string) => byId.get(id)?.name || '(onbekend)'

  // Relaties per element (in beide richtingen) voor koppeling-/weescontrole
  const linkedLayers = new Map<string, Set<Layer>>()
  const degree = new Map<string, number>()
  model.elements.forEach((e) => {
    linkedLayers.set(e.id, new Set())
    degree.set(e.id, 0)
  })
  const touch = (id: string, otherLayer: Layer) => {
    degree.set(id, (degree.get(id) || 0) + 1)
    linkedLayers.get(id)?.add(otherLayer)
  }
  model.relations.forEach((r) => {
    const s = byId.get(r.source)
    const t = byId.get(r.target)
    if (s && t) {
      touch(s.id, t.layer)
      touch(t.id, s.layer)
    }
  })

  // ── 1. Toegestane laagovergangen ────────────────────────────────────────
  const allowed = new Set(ALLOWED_LAYER_TRANSITIONS.map(([a, b]) => `${a}>${b}`))
  model.relations.forEach((r) => {
    const s = byId.get(r.source)
    const t = byId.get(r.target)
    if (!s || !t) return
    if (s.layer === t.layer || s.layer === 'other' || t.layer === 'other') return
    if (!allowed.has(`${s.layer}>${t.layer}`)) {
      findings.push(
        nf({
          severity: 'error',
          category: 'laagovergang',
          title: `Verboden laagovergang: ${s.layer} → ${t.layer}`,
          detail: `${r.type}-relatie van "${s.name}" (${s.layer}) naar "${t.name}" (${t.layer}). Deze laagovergang is niet toegestaan volgens het metamodel.`,
          layer: s.layer,
          elementName: s.name,
          rule: 'Toegestane laagovergangen',
        })
      )
    }
  })

  // ── 2. Verplichte attributen ────────────────────────────────────────────
  model.elements.forEach((e) => {
    const required = REQUIRED_PROPERTIES[e.layer] || []
    required.forEach((prop) => {
      const val = e.properties[prop]
      if (!val || !val.trim()) {
        findings.push(
          nf({
            severity: 'warning',
            category: 'attribuut',
            title: `Ontbrekend attribuut "${prop}"`,
            detail: `${e.type} "${e.name || '(naamloos)'}" mist het verplichte attribuut "${prop}".`,
            layer: e.layer,
            elementName: e.name,
            rule: `Verplicht attribuut: ${prop}`,
          })
        )
      }
    })
    if (REQUIRE_DOCUMENTATION_FOR_LAYERS.includes(e.layer) && !e.documentation.trim()) {
      findings.push(
        nf({
          severity: 'info',
          category: 'attribuut',
          title: 'Ontbrekende documentatie',
          detail: `${e.type} "${e.name || '(naamloos)'}" heeft geen beschrijving/documentatie.`,
          layer: e.layer,
          elementName: e.name,
          rule: 'Documentatie verplicht',
        })
      )
    }
  })

  // ── 3. Verplichte koppelingen ───────────────────────────────────────────
  model.elements.forEach((e) => {
    REQUIRED_LINKS.filter((rule) => rule.elementType === e.type).forEach((rule) => {
      if (!linkedLayers.get(e.id)?.has(rule.toLayer)) {
        findings.push(
          nf({
            severity: 'error',
            category: 'koppeling',
            title: `Ontbrekende koppeling naar ${rule.toLayer}`,
            detail: `${e.type} "${e.name}" heeft geen relatie naar de ${rule.toLayer}laag. ${rule.uitleg}`,
            layer: e.layer,
            elementName: e.name,
            rule: `Verplichte koppeling: ${e.type} → ${rule.toLayer}`,
          })
        )
      }
    })
  })

  // ── 4. Naamgeving & dubbelen ────────────────────────────────────────────
  const nameCount = new Map<string, number>()
  model.elements.forEach((e) => {
    const key = e.name.trim().toLowerCase()
    if (key) nameCount.set(key, (nameCount.get(key) || 0) + 1)
  })
  const reportedDupes = new Set<string>()
  model.elements.forEach((e) => {
    const trimmed = e.name.trim()
    if (!trimmed) {
      findings.push(
        nf({
          severity: 'error',
          category: 'naamgeving',
          title: 'Element zonder naam',
          detail: `Een ${e.type} (id ${e.id}) heeft geen naam.`,
          layer: e.layer,
          rule: 'Naam verplicht',
        })
      )
    } else if (!NAME_PATTERN.test(trimmed)) {
      findings.push(
        nf({
          severity: 'warning',
          category: 'naamgeving',
          title: 'Naam volgt conventie niet',
          detail: `"${trimmed}" (${e.type}) — ${NAME_PATTERN_UITLEG}`,
          layer: e.layer,
          elementName: e.name,
          rule: 'Naamconventie',
        })
      )
    }
    const key = trimmed.toLowerCase()
    if (key && (nameCount.get(key) || 0) > 1 && !reportedDupes.has(key)) {
      reportedDupes.add(key)
      findings.push(
        nf({
          severity: 'warning',
          category: 'naamgeving',
          title: 'Dubbele naam',
          detail: `De naam "${trimmed}" komt ${nameCount.get(key)}× voor in het model.`,
          layer: e.layer,
          elementName: e.name,
          rule: 'Geen dubbele namen',
        })
      )
    }
  })

  // Wees-elementen (geen enkele relatie)
  if (FLAG_ORPHANS) {
    model.elements.forEach((e) => {
      if ((degree.get(e.id) || 0) === 0) {
        findings.push(
          nf({
            severity: 'info',
            category: 'naamgeving',
            title: 'Wees-element (geen relaties)',
            detail: `${e.type} "${e.name || '(naamloos)'}" heeft geen enkele relatie en staat los in het model.`,
            layer: e.layer,
            elementName: e.name,
            rule: 'Geen losse elementen',
          })
        )
      }
    })
  }

  // ── 5. Standaard ArchiMate-relatieregels ────────────────────────────────
  model.relations.forEach((r) => {
    const s = byId.get(r.source)
    const t = byId.get(r.target)
    // Dangling: bron of doel bestaat niet
    if (!s || !t) {
      findings.push(
        nf({
          severity: 'error',
          category: 'archimate',
          title: 'Relatie verwijst naar onbekend element',
          detail: `${r.type}-relatie ${r.id}: bron "${nameOf(r.source)}" of doel "${nameOf(r.target)}" bestaat niet in het model.`,
          layer: s?.layer || t?.layer || 'other',
          rule: 'Geldige relatie-eindpunten',
        })
      )
      return
    }
    // Access mag alleen een passief element als doel hebben
    if (r.type === 'Access' && !PASSIVE_TYPES.has(t.type)) {
      findings.push(
        nf({
          severity: 'error',
          category: 'archimate',
          title: 'Ongeldige Access-relatie',
          detail: `Access van "${s.name}" naar "${t.name}" (${t.type}). Een Access-relatie mag alleen een passief data-element benaderen (bijv. DataObject of BusinessObject).`,
          layer: s.layer,
          elementName: s.name,
          rule: 'ArchiMate: Access alleen naar passieve structuur',
        })
      )
    }
    // Zelf-relatie
    if (r.source === r.target) {
      findings.push(
        nf({
          severity: 'warning',
          category: 'archimate',
          title: 'Relatie naar zichzelf',
          detail: `${r.type}-relatie van "${s.name}" naar zichzelf.`,
          layer: s.layer,
          elementName: s.name,
          rule: 'ArchiMate: geen zelf-relaties',
        })
      )
    }
  })

  return findings
}
