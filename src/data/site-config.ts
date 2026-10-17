/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://dentimetre.fr";
export const SITE_NAMES: Record<string, string> = {"fr": "Dentimètre", "en": "Dentimetre"};
export const LANG_TAGS: Record<string, string> = {"fr": "fr-FR", "en": "en-FR"};
export const OG_LOCALES: Record<string, string> = {"fr": "fr_FR", "en": "en_GB"};
export const LOCALE_TAG = 'fr-FR';
/** Formats de nombre par langue de page (RECETTE §4) : 1 234 € en français, €1,234 en anglais. */
export const LOCALE_BY_LANG: Record<string, string> = { fr: 'fr-FR', en: 'en-GB' };
export const CURRENCY = 'EUR';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
export const LAST_UPDATED = '2026-10-15';
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"fr": "Éditeur d'outils de comparaison pour les cabinets dentaires libéraux · honoraires, charges, ratios", "en": "Publisher of benchmarking tools for French dental practices · fees, costs, ratios"};
export const AUTHOR_DESC: Record<string, string> = {"fr": "Radif Partners rapproche les honoraires saisis par un chirurgien-dentiste des montants que l'Assurance Maladie publie chaque année par département et par spécialité (open data du SNDS), et des statistiques publiques sur les revenus et les charges de la profession. Chaque chiffre affiché renvoie à son jeu de données et à son année.", "en": "Radif Partners compares the fees a French dentist enters with the amounts the national health insurer (Assurance Maladie) publishes every year by département and specialty from the SNDS open data, and with public statistics on the profession's income and costs. Every figure shown links to its dataset and year."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"fr": ["Honoraires des chirurgiens-dentistes libéraux", "Orthopédie dento-faciale", "Gestion d'un cabinet dentaire", "Bénéfices non commerciaux", "SELARL de chirurgiens-dentistes"], "en": ["French dentists' fee income", "Orthodontics (ODF) in France", "Dental practice management", "BNC self-employed profit", "Dental SELARL companies"]};
export const CONTACT_EMAIL = "contact@dentimetre.fr";
export const THEME_COLOR = '#0B4F8A';
export const LOGO_SYMBOL = 'dent';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau, aucun cookie, Clarity chargé en mode sans cookie (consentv2 denied).
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
export const GA4_ID = 'G-GNV4RY56ZX';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = 'yz4c1h8gua';
export const INDEXNOW_KEY = 'd3f17a92c4b84e06a1e5f0b7c29d8e41';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',  // éditeur de tous les sites du portefeuille (RECETTE §8)
  legalForm: '',  // vide : publication à titre personnel, pas de société
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "France",
  phone: '',
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "TVA",
  vatNumber: '',
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
