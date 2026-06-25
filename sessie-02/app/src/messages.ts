import type { Tone } from "./api";

/** Lokale felicitatie-generator — geen AI/API-key nodig.
 *  Vult naam, leeftijd en interesses in en kiest een willekeurige variant,
 *  zodat "Opnieuw" telkens een ander berichtje geeft. */

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface Args {
  name: string;
  tone: Tone;
  note?: string;
  age?: number;
}

export function generateFelicitatie({ name, tone, note, age }: Args): string {
  const interests = (note || "").trim();
  // "Op naar een jaar vol padel, goede koffie!" — alleen als er interesses zijn.
  const wish = interests ? ` Op naar een jaar vol ${interests}!` : "";
  const bday = age ? `${age}e verjaardag` : "verjaardag";

  const variants: Record<Tone, string[]> = {
    hartelijk: [
      `Lieve ${name}, van harte gefeliciteerd met je ${bday}! 🎉 Ik hoop dat je een prachtige dag hebt met de mensen die je lief zijn.${wish} 💛`,
      `Gefeliciteerd ${name}! 🥳 Geniet met volle teugen van je dag — je verdient het.${wish} 🎂`,
      `Hoi ${name}, gefeliciteerd met je ${bday}! 🎈 Ik wens je een dag vol warmte, taart en lieve mensen om je heen.${wish}`,
    ],
    grappig: [
      `Hieperdepiep, ${name}! 🥳 Weer een jaar wijzer en nog steeds geen grijze haren te bekennen (toch?). Maak er een topdag van!${wish} 🎉`,
      `Gefeliciteerd ${name}! 🎂 Officieel weer een jaar dichter bij seniorenkorting. Geniet ervan!${wish}`,
      `${name}!! 🎈 Vandaag mag álles: extra taart, geen afwas, en zo vaak "want ik ben jarig" zeggen als je wilt. Fijne verjaardag!${wish}`,
    ],
    formeel: [
      `Beste ${name}, van harte gefeliciteerd met je ${bday}. Ik wens je een fijne dag en alle goeds voor het komende jaar.${wish}`,
      `Beste ${name}, gefeliciteerd met je ${bday}. Ik hoop dat je een aangename dag tegemoet gaat.${wish}`,
    ],
    kort: [
      `Gefeliciteerd, ${name}! 🎉`,
      `Fijne verjaardag ${name}! 🎂`,
      `Hé ${name}, gefeliciteerd! 🥳`,
    ],
  };

  return pick(variants[tone] || variants.hartelijk);
}
