import { useState } from 'react'
import { LAYER_LABEL, type Layer } from './types'
import {
  ALLOWED_LAYER_TRANSITIONS,
  REQUIRED_PROPERTIES,
  REQUIRE_DOCUMENTATION_FOR_LAYERS,
  REQUIRED_LINKS,
  NAME_PATTERN_UITLEG,
} from './metamodel'

// Toont welke metamodel-regels op dit moment gevalideerd worden.
// Zo is voor iedereen transparant waaraan het model wordt getoetst.
export function MetamodelPanel() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
      >
        Toon metamodel-regels
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="my-8 w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Het metamodel — toetsingsregels</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              Het model wordt getoetst aan de <strong>standaard ArchiMate-relatieregels</strong>{' '}
              én aan de eigen metamodel-regels hieronder. Pas deze aan in{' '}
              <code className="rounded bg-slate-100 px-1">src/metamodel.ts</code>.
            </p>

            <Section title="1. Toegestane laagovergangen">
              <ul className="grid grid-cols-2 gap-1 text-sm">
                {ALLOWED_LAYER_TRANSITIONS.map(([a, b], i) => (
                  <li key={i} className="text-slate-700">
                    {LAYER_LABEL[a]} → {LAYER_LABEL[b]}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-slate-500">
                Andere relaties tussen verschillende lagen gelden als afwijking.
              </p>
            </Section>

            <Section title="2. Verplichte attributen">
              <ul className="space-y-1 text-sm text-slate-700">
                {(Object.keys(REQUIRED_PROPERTIES) as Layer[]).map((l) => (
                  <li key={l}>
                    <strong>{LAYER_LABEL[l]}:</strong> {REQUIRED_PROPERTIES[l]!.join(', ')}
                  </li>
                ))}
                <li>
                  <strong>Documentatie verplicht voor:</strong>{' '}
                  {REQUIRE_DOCUMENTATION_FOR_LAYERS.map((l) => LAYER_LABEL[l]).join(', ')}
                </li>
              </ul>
            </Section>

            <Section title="3. Verplichte koppelingen">
              <ul className="space-y-1 text-sm text-slate-700">
                {REQUIRED_LINKS.map((r, i) => (
                  <li key={i}>
                    <strong>{r.elementType}</strong> → {LAYER_LABEL[r.toLayer]}
                    <span className="text-slate-500"> — {r.uitleg}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="4. Naamgeving & dubbelen">
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>{NAME_PATTERN_UITLEG}</li>
                <li>Geen lege namen.</li>
                <li>Geen dubbele namen.</li>
                <li>Geen wees-elementen (zonder enkele relatie).</li>
              </ul>
            </Section>

            <Section title="Standaard ArchiMate-relatieregels">
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Access-relatie mag alleen een passief data-element als doel hebben.</li>
                <li>Relaties mogen niet naar een niet-bestaand element verwijzen.</li>
                <li>Geen relatie van een element naar zichzelf.</li>
              </ul>
            </Section>
          </div>
        </div>
      )}
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-slate-200 p-3">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  )
}
