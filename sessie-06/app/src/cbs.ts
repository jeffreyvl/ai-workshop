// Datalaag: haalt ECHTE, openbare cijfers op bij CBS StatLine Open Data.
// Geen API-sleutel nodig; CBS ondersteunt CORS, dus de browser kan rechtstreeks ophalen.
//
// Bronnen (CBS Open Data, https://opendata.cbs.nl):
//   37789ksz — Sociale zekerheid; kerncijfers, uitkeringen naar uitkeringssoort (maandreeks, ×1.000)
//   80794ned — Personen met een uitkering; uitkeringsontvangers per regio (provincies)
//   85615NED — Personen met bijstand; (her)instromers en uitstromers (per kwartaal)

const BASE = 'https://opendata.cbs.nl/ODataApi/odata'

// ---- Types die de componenten gebruiken --------------------------------

export type Richting = 'goed' | 'slecht'

export interface Kpi {
  id: string
  label: string
  waarde: number
  eenheid: string
  vorigePeriode: number
  richting: Richting
  toelichting: string
}

export interface TrendPunt {
  maand: string
  bijstand: number
  ww: number
  wajong: number
  wia: number
  wao: number
}

export interface Verdeling {
  naam: string
  aantal: number
  kleur: string
}

export interface FlowPunt {
  kwartaal: string
  instroom: number
  uitstroom: number
}

export interface RegioRij {
  regio: string
  totaal: number
  bijstand: number
  arbeidsongeschikt: number
  wajong: number
  aandeelAO: number // % van totaal dat arbeidsongeschikt is
}

export interface Signaal {
  id: string
  niveau: 'kans' | 'aandacht' | 'urgent'
  titel: string
  beschrijving: string
  regio: string
  actie: string
}

export interface DashboardData {
  peilmaandSoort: string
  peilmaandRegio: string
  peilkwartaalFlow: string
  kpis: Kpi[]
  trend: TrendPunt[]
  bijstandFlow: FlowPunt[]
  soortVerdeling: Verdeling[]
  aoRegeling: Verdeling[]
  regios: RegioRij[]
  signalen: Signaal[]
}

// ---- Hulpfuncties -------------------------------------------------------

const maandKort = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
const maandVol = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']

function parsePeriode(code: string) {
  // bv. "2026MM03"
  const jaar = code.slice(0, 4)
  const mm = parseInt(code.slice(6), 10)
  return { jaar, mm }
}
const labelKort = (code: string) => {
  const { jaar, mm } = parsePeriode(code)
  return `${maandKort[mm - 1]} '${jaar.slice(2)}`
}
const labelVol = (code: string) => {
  const { jaar, mm } = parsePeriode(code)
  return `${maandVol[mm - 1]} ${jaar}`
}
// bv. "2025KW04" -> "K4 '25"
const labelKwartaalKort = (code: string) => `K${code.slice(6)} '${code.slice(2, 4)}`
const labelKwartaalVol = (code: string) => `${code.slice(0, 4)} kwartaal ${parseInt(code.slice(6), 10)}`

const PROVINCIES: Record<string, string> = {
  PV20: 'Groningen', PV21: 'Fryslân', PV22: 'Drenthe', PV23: 'Overijssel',
  PV24: 'Flevoland', PV25: 'Gelderland', PV26: 'Utrecht', PV27: 'Noord-Holland',
  PV28: 'Zuid-Holland', PV29: 'Zeeland', PV30: 'Noord-Brabant', PV31: 'Limburg',
}

async function haal(url: string): Promise<any[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`CBS gaf status ${res.status}`)
  const json = await res.json()
  return json.value as any[]
}

// ---- Hoofdfunctie: alles ophalen en transformeren -----------------------

export async function haalDashboardData(): Promise<DashboardData> {
  const f = '%24format=json'

  // 1) Maandreeks naar uitkeringssoort (nationaal, ×1.000)
  const soortFilter = encodeURIComponent(
    "substringof('2025MM',Perioden) or substringof('2026MM',Perioden) or substringof('2027MM',Perioden)",
  )
  const soortSelect =
    'Perioden,BijstandsuitkeringenTotDeAOWLeeftijd_12,NietSeizoengecorrigeerd_8,' +
    'WajongUitkeringen_3,TotaalWIAUitkeringen_5,WAOUitkeringen_2,IVAUitkeringen_6,WGAUitkeringen_7'
  const soortUrl = `${BASE}/37789ksz/TypedDataSet?${f}&%24filter=${soortFilter}&%24select=${soortSelect}`

  // 2) Laatste periode + provinciecijfers
  const periodenUrl = `${BASE}/80794ned/Perioden?${f}`

  // 3) In- en uitstroom bijstand (per kwartaal, totaal over alle persoonskenmerken)
  const flowFilter = encodeURIComponent(
    "Geslacht eq 'T001038' and Leeftijd eq '10000' and Herkomstland eq 'T001040' and GeboortelandOuders eq 'T001638' and " +
      "(substringof('2023',Perioden) or substringof('2024',Perioden) or substringof('2025',Perioden) or substringof('2026',Perioden) or substringof('2027',Perioden))",
  )
  const flowUrl = `${BASE}/85615NED/TypedDataSet?${f}&%24filter=${flowFilter}&%24select=Perioden,Instromers_1,Uitstromers_3`

  const [soortRows, periodenRows, flowRows] = await Promise.all([
    haal(soortUrl),
    haal(periodenUrl),
    haal(flowUrl),
  ])

  const bijstandFlow: FlowPunt[] = flowRows
    .filter((r) => /KW\d\d$/.test(r.Perioden))
    .sort((a, b) => a.Perioden.localeCompare(b.Perioden))
    .map((r) => ({
      kwartaal: labelKwartaalKort(r.Perioden),
      instroom: r.Instromers_1 ?? 0,
      uitstroom: r.Uitstromers_3 ?? 0,
    }))
  const laatsteFlow = flowRows.filter((r) => /KW\d\d$/.test(r.Perioden)).sort((a, b) => a.Perioden.localeCompare(b.Perioden)).slice(-1)[0]
  const peilkwartaalFlow = laatsteFlow ? labelKwartaalVol(laatsteFlow.Perioden) : ''

  // Maandreeks sorteren op periode
  const reeks = soortRows
    .filter((r) => /MM\d\d$/.test(r.Perioden))
    .sort((a, b) => a.Perioden.localeCompare(b.Perioden))

  const trend: TrendPunt[] = reeks.map((r) => ({
    maand: labelKort(r.Perioden),
    bijstand: r.BijstandsuitkeringenTotDeAOWLeeftijd_12 ?? 0,
    ww: r.NietSeizoengecorrigeerd_8 ?? 0,
    wajong: r.WajongUitkeringen_3 ?? 0,
    wia: r.TotaalWIAUitkeringen_5 ?? 0,
    wao: r.WAOUitkeringen_2 ?? 0,
  }))

  const laatste = reeks[reeks.length - 1]
  const vorige = reeks[reeks.length - 2]
  const peilmaandSoort = labelVol(laatste.Perioden)

  // KPI's (×1.000 → personen)
  const kpi = (
    id: string, label: string, nu: number, eerder: number, toelichting: string,
  ): Kpi => ({ id, label, waarde: Math.round(nu * 1000), vorigePeriode: Math.round(eerder * 1000), eenheid: '', richting: 'slecht', toelichting })

  const ao = (r: any) => (r.TotaalWIAUitkeringen_5 ?? 0) + (r.WAOUitkeringen_2 ?? 0) + (r.WajongUitkeringen_3 ?? 0)

  const kpis: Kpi[] = [
    kpi('bijstand', 'Bijstand (< AOW-leeftijd)', laatste.BijstandsuitkeringenTotDeAOWLeeftijd_12, vorige.BijstandsuitkeringenTotDeAOWLeeftijd_12, 'Mensen in de Participatiewet onder de AOW-leeftijd. Bron: CBS 37789ksz.'),
    kpi('ww', 'WW-uitkeringen', laatste.NietSeizoengecorrigeerd_8, vorige.NietSeizoengecorrigeerd_8, 'Lopende werkloosheidsuitkeringen (conjunctuurgevoelig). Bron: CBS 37789ksz.'),
    kpi('wajong', 'Wajong (jonggehandicapten)', laatste.WajongUitkeringen_3, vorige.WajongUitkeringen_3, 'Jongeren met een arbeidsbeperking — kern van de inclusieve arbeidsmarkt. Bron: CBS 37789ksz.'),
    kpi('ao', 'Arbeidsongeschiktheid totaal', ao(laatste), ao(vorige), 'WIA + WAO + Wajong samen. Bron: CBS 37789ksz.'),
  ]

  // Verdeling naar soort (laatste maand)
  const soortVerdeling: Verdeling[] = [
    { naam: 'Bijstand', aantal: laatste.BijstandsuitkeringenTotDeAOWLeeftijd_12, kleur: '#154273' },
    { naam: 'WW', aantal: laatste.NietSeizoengecorrigeerd_8, kleur: '#f59e0b' },
    { naam: 'Wajong', aantal: laatste.WajongUitkeringen_3, kleur: '#10b981' },
    { naam: 'WIA', aantal: laatste.TotaalWIAUitkeringen_5, kleur: '#3b82f6' },
    { naam: 'WAO', aantal: laatste.WAOUitkeringen_2, kleur: '#94a3b8' },
  ]

  // Arbeidsongeschiktheid naar regeling (laatste maand)
  const aoRegeling: Verdeling[] = [
    { naam: 'WIA · WGA', aantal: laatste.WGAUitkeringen_7 ?? 0, kleur: '#3b82f6' },
    { naam: 'WIA · IVA', aantal: laatste.IVAUitkeringen_6 ?? 0, kleur: '#60a5fa' },
    { naam: 'WAO', aantal: laatste.WAOUitkeringen_2 ?? 0, kleur: '#94a3b8' },
    { naam: 'Wajong', aantal: laatste.WajongUitkeringen_3 ?? 0, kleur: '#10b981' },
  ]

  // Provinciecijfers voor de laatste beschikbare periode
  const laatstePeriodeRegio = periodenRows[periodenRows.length - 1].Key.trim()
  const peilmaandRegio = labelVol(laatstePeriodeRegio)
  const regioFilter = encodeURIComponent(`Perioden eq '${laatstePeriodeRegio}' and substringof('PV',RegioS)`)
  const regioSelect = 'RegioS,TotDeAOWLeeftijd_2,Werkloosheid_4,BijstandTotDeAOWLeeftijd_7,ArbeidsongeschiktheidTotaal_8,WajongUitkering_11'
  const regioRows = await haal(`${BASE}/80794ned/TypedDataSet?${f}&%24filter=${regioFilter}&%24select=${regioSelect}`)

  const regios: RegioRij[] = regioRows
    .map((r) => {
      const totaal = r.TotDeAOWLeeftijd_2 ?? 0
      const arbeidsongeschikt = r.ArbeidsongeschiktheidTotaal_8 ?? 0
      return {
        regio: PROVINCIES[r.RegioS.trim()] ?? r.RegioS.trim(),
        totaal,
        bijstand: r.BijstandTotDeAOWLeeftijd_7 ?? 0,
        arbeidsongeschikt,
        wajong: r.WajongUitkering_11 ?? 0,
        aandeelAO: totaal ? Math.round((arbeidsongeschikt / totaal) * 100) : 0,
      }
    })
    .filter((r) => r.totaal > 0)

  const signalen = leidSignalenAf(trend, regios, bijstandFlow)

  return { peilmaandSoort, peilmaandRegio, peilkwartaalFlow, kpis, trend, bijstandFlow, soortVerdeling, aoRegeling, regios, signalen }
}

// ---- Signalen AFLEIDEN uit de echte cijfers -----------------------------

function pct(nu: number, eerder: number) {
  return eerder ? ((nu - eerder) / eerder) * 100 : 0
}

function leidSignalenAf(trend: TrendPunt[], regios: RegioRij[], flow: FlowPunt[]): Signaal[] {
  const s: Signaal[] = []

  // In-/uitstroom bijstand: groeit of krimpt het bestand?
  if (flow.length) {
    const f = flow[flow.length - 1]
    const saldo = f.instroom - f.uitstroom
    s.push({
      id: 'flow',
      niveau: saldo > 0 ? 'aandacht' : 'kans',
      titel: saldo > 0 ? 'Bijstand: meer in- dan uitstroom' : 'Bijstand: meer uit- dan instroom',
      beschrijving: `Laatste kwartaal stroomden ${f.instroom.toLocaleString('nl-NL')} mensen de bijstand in en ${f.uitstroom.toLocaleString('nl-NL')} eruit (saldo ${saldo >= 0 ? '+' : ''}${saldo.toLocaleString('nl-NL')}). Het bestand ${saldo > 0 ? 'groeit' : 'krimpt'}.`,
      regio: 'Landelijk',
      actie: saldo > 0 ? 'Uitstroom naar werk versnellen om de groei te keren.' : 'Aanpak vasthouden die uitstroom op gang houdt.',
    })
  }

  const n = trend.length
  if (n >= 2) {
    const last = trend[n - 1]
    const prev = trend[n - 2]

    // WW maand-op-maand
    const wwMoM = pct(last.ww, prev.ww)
    s.push({
      id: 'ww',
      niveau: wwMoM > 1 ? 'urgent' : wwMoM > 0 ? 'aandacht' : 'kans',
      titel: wwMoM >= 0 ? 'WW-uitkeringen stijgen' : 'WW-uitkeringen dalen',
      beschrijving: `Het aantal WW-uitkeringen ${wwMoM >= 0 ? 'steeg' : 'daalde'} de laatste maand met ${Math.abs(wwMoM).toFixed(1)}% (nu ± ${Math.round(last.ww)} duizend).`,
      regio: 'Landelijk',
      actie: wwMoM >= 0 ? 'Werk-naar-werk en snelle bemiddeling intensiveren.' : 'Gunstig moment om langdurig werkzoekenden te plaatsen.',
    })

    // WIA-trend over de hele reeks (arbeidsongeschiktheid)
    const wiaTrend = pct(last.wia, trend[0].wia)
    if (Math.abs(wiaTrend) > 0.5) {
      s.push({
        id: 'wia',
        niveau: wiaTrend > 0 ? 'aandacht' : 'kans',
        titel: wiaTrend > 0 ? 'WIA blijft oplopen' : 'WIA neemt af',
        beschrijving: `Over de getoonde periode ${wiaTrend > 0 ? 'steeg' : 'daalde'} het aantal WIA-uitkeringen met ${Math.abs(wiaTrend).toFixed(1)}%.`,
        regio: 'Landelijk',
        actie: wiaTrend > 0 ? 'Inzetten op behoud van werk en preventie van uitval.' : 'Aanpak delen die uitval voorkomt.',
      })
    }

    // Bijstand maand-op-maand
    const bijMoM = pct(last.bijstand, prev.bijstand)
    s.push({
      id: 'bijstand',
      niveau: bijMoM > 0.5 ? 'aandacht' : 'kans',
      titel: bijMoM >= 0 ? 'Bijstand licht gestegen' : 'Bijstand daalt',
      beschrijving: `De bijstand (< AOW) ${bijMoM >= 0 ? 'nam toe' : 'nam af'} met ${Math.abs(bijMoM).toFixed(1)}% t.o.v. de maand ervoor.`,
      regio: 'Landelijk',
      actie: bijMoM >= 0 ? 'Re-integratiecapaciteit op peil houden.' : 'Uitstroom vasthouden met nazorg op de werkplek.',
    })
  }

  // Provincie met hoogste aandeel arbeidsongeschiktheid
  if (regios.length) {
    const top = [...regios].sort((a, b) => b.aandeelAO - a.aandeelAO)[0]
    s.push({
      id: 'regio-ao',
      niveau: 'aandacht',
      titel: `Hoog aandeel arbeidsongeschiktheid: ${top.regio}`,
      beschrijving: `In ${top.regio} is ${top.aandeelAO}% van de uitkeringen (< AOW) een arbeidsongeschiktheidsuitkering — het hoogste van alle provincies.`,
      regio: top.regio,
      actie: 'Onderzoek oorzaken (bv. sectorstructuur) en zet in op aangepast werk.',
    })

    const grootste = [...regios].sort((a, b) => b.totaal - a.totaal)[0]
    s.push({
      id: 'regio-totaal',
      niveau: 'kans',
      titel: `Grootste opgave: ${grootste.regio}`,
      beschrijving: `${grootste.regio} telt de meeste uitkeringen (< AOW): ± ${grootste.totaal.toLocaleString('nl-NL')} personen.`,
      regio: grootste.regio,
      actie: 'Schaalvoordeel benutten met regionale werkgeversafspraken.',
    })
  }

  return s
}
