import type { Locale } from './routes';
const fr = {
  updatedOn: 'Mis à jour le', editorialPolicy: 'Charte éditoriale', contactLabel: 'Contact', reviewedBy: 'Vérifié par',
  skipToContent: 'Aller au contenu', mainNav: 'Navigation principale', breadcrumbLabel: 'Fil d’Ariane', breadcrumbHome: 'Accueil', menuOpen: 'Ouvrir le menu',
  faqTitle: 'Questions fréquentes', relatedCalculators: 'Pages et simulateurs associés', sourcesTitle: 'Sources', writtenBy: 'Rédigé par',
  asOf: 'Textes et barèmes', lastUpdated: 'vérifiés le', footerValidated: 'Données Assurance Maladie, DREES, UNASA, CARCDSF', footerBrowser: '100 % dans votre navigateur · aucune donnée transmise · gratuit',
  footerDisclaimer: 'Site indépendant, édité par Radif Partners. Il n’est affilié ni à l’Assurance Maladie, ni à l’Ordre des chirurgiens-dentistes, ni à un syndicat, un organisme de gestion agréé ou un fournisseur. Les comparaisons reposent sur des moyennes publiques et vos propres saisies : ce sont des estimations indicatives, qui ne remplacent pas l’avis d’un expert-comptable. Aucune donnée vendue, aucune mise en relation.', footerPopular: '', notFound: 'Cette page n’existe pas.',
  readMore: 'Lire la suite',
};
const en: typeof fr = {
  updatedOn: 'Updated on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Checked by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Frequently asked questions', relatedCalculators: 'Related pages and calculators', sourcesTitle: 'Sources', writtenBy: 'Written by',
  asOf: 'Rules and rates', lastUpdated: 'checked on', footerValidated: 'Data: Assurance Maladie, DREES, UNASA, CARCDSF', footerBrowser: '100% in your browser · no data sent · free',
  footerDisclaimer: 'Independent site published by Radif Partners. It is not affiliated with Assurance Maladie, the Ordre des chirurgiens-dentistes, any union, approved management association or supplier. Comparisons rest on public averages and your own inputs: they are indicative estimates and do not replace an accountant’s advice. No data sold, no referrals.', footerPopular: '', notFound: 'This page does not exist.',
  readMore: 'Read more',
};
export function t(lang: Locale) { return lang === 'en' ? en : fr; }
