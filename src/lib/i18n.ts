// Customer-facing text only (join page + card). No server imports, safe for client components.
export type Lang = "en" | "af" | "xh";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "af", label: "Afrikaans" },
  { code: "xh", label: "isiXhosa" },
];

const en = {
  joinTitle: "Get rewarded for coming back",
  collect: "Collect {n} stamps to earn your reward.",
  rewardLabel: "Reward",
  yourName: "Your name",
  phone: "Phone number",
  consent: "I agree that {business} may store my name and phone number to run this loyalty programme.",
  privacyNotice: "Privacy notice",
  privacyBody: "We store your name, phone number and the dates of your visits. {business} can see them. They are used only for this loyalty programme. You can ask {business} to delete your details at any time.",
  joinBtn: "Join and get my card",
  joining: "Joining…",
  errConsent: "Please tick the privacy box to join.",
  errName: "Please enter your name.",
  errPhone: "Please enter a valid phone number.",
  errGeneric: "Something went wrong. Please try again.",
  rewardAvailable: "Reward available!",
  showStaff: "Show this card to staff to claim your reward.",
  moreOne: "1 more stamp to your reward.",
  moreMany: "{n} more stamps to your reward.",
  rewardsClaimed: "Rewards claimed so far: {n}",
  scanForStamp: "Show this code to staff to get your stamp",
  bookmark: "Bookmark this page or add it to your home screen. It’s your card. Stamps are added by staff after each paid visit.",
};
export type Dict = typeof en;

const af: Dict = {
  joinTitle: "Word beloon vir terugkom",
  collect: "Versamel {n} stempels om jou beloning te verdien.",
  rewardLabel: "Beloning",
  yourName: "Jou naam",
  phone: "Foonnommer",
  consent: "Ek stem in dat {business} my naam en foonnommer mag stoor om hierdie getrouheidsprogram te bestuur.",
  privacyNotice: "Privaatheidskennisgewing",
  privacyBody: "Ons stoor jou naam, foonnommer en die datums van jou besoeke. {business} kan dit sien. Dit word slegs vir hierdie getrouheidsprogram gebruik. Jy kan {business} enige tyd vra om jou besonderhede uit te vee.",
  joinBtn: "Sluit aan en kry my kaart",
  joining: "Sluit aan…",
  errConsent: "Merk asseblief die privaatheidsblokkie om aan te sluit.",
  errName: "Voer asseblief jou naam in.",
  errPhone: "Voer asseblief ’n geldige foonnommer in.",
  errGeneric: "Iets het skeefgeloop. Probeer asseblief weer.",
  rewardAvailable: "Beloning beskikbaar!",
  showStaff: "Wys hierdie kaart vir personeel om jou beloning te eis.",
  moreOne: "Nog 1 stempel tot jou beloning.",
  moreMany: "Nog {n} stempels tot jou beloning.",
  rewardsClaimed: "Belonings tot dusver geëis: {n}",
  scanForStamp: "Wys hierdie kode vir personeel om jou stempel te kry",
  bookmark: "Maak hierdie bladsy ’n boekmerk of voeg dit by jou tuisskerm. Dit is jou kaart. Personeel voeg stempels by ná elke betaalde besoek.",
};

const xh: Dict = {
  joinTitle: "Fumana umvuzo xa ubuya kwakhona",
  collect: "Qokelela izitampu ezi-{n} ukuze ufumane umvuzo wakho.",
  rewardLabel: "Umvuzo",
  yourName: "Igama lakho",
  phone: "Inombolo yefowuni",
  consent: "Ndiyavuma ukuba {business} ingagcina igama lam kunye nenombolo yam yefowuni ukuze iqhube le nkqubo yemivuzo.",
  privacyNotice: "Isaziso sobumfihlo",
  privacyBody: "Sigcina igama lakho, inombolo yefowuni kunye neentsuku zotyelelo lwakho. {business} inokuzibona. Zisetyenziselwa le nkqubo yemivuzo kuphela. Unokucela {business} ukuba isuse iinkcukacha zakho nanini na.",
  joinBtn: "Joyina ufumane ikhadi lam",
  joining: "Iyajoyina…",
  errConsent: "Nceda ukhethe ibhokisi yobumfihlo ukuze ujoyine.",
  errName: "Nceda ufake igama lakho.",
  errPhone: "Nceda ufake inombolo yefowuni esebenzayo.",
  errGeneric: "Kukho into engahambanga kakuhle. Nceda uzame kwakhona.",
  rewardAvailable: "Umvuzo uyafumaneka!",
  showStaff: "Libonise eli khadi kubasebenzi ukuze ufumane umvuzo wakho.",
  moreOne: "Sele isitampu esi-1 ukuya kumvuzo wakho.",
  moreMany: "Zisele izitampu ezi-{n} ukuya kumvuzo wakho.",
  rewardsClaimed: "Imivuzo esele iyifumene: {n}",
  scanForStamp: "Libonise eli khowudi kubasebenzi ukuze ufumane isitampu sakho",
  bookmark: "Gcina eli phepha kwi-bookmark okanye uliyongeze kwisikrini sakho esiyintloko. Lelakho ikhadi. Izitampu ziyongezwa ngabasebenzi emva kwotyelelo ngalunye olihlawulelweyo.",
};

export const dict: Record<Lang, Dict> = { en, af, xh };

export function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}
