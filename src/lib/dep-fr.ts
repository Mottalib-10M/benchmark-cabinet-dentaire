/**
 * Prépositions françaises des départements : « dans le Rhône », « en Gironde », « dans les
 * Yvelines », « à Paris ». Sans elles, un texte généré écrit « dans Gironde » : ça se voit.
 * `dans` = forme de lieu ; `de` = complément (« les dentistes du Rhône, de Gironde, des Landes »).
 */
const L: Record<string, [string, string]> = {
  '01': ["dans l'Ain", "de l'Ain"], '02': ["dans l'Aisne", "de l'Aisne"], '03': ["dans l'Allier", "de l'Allier"],
  '04': ['dans les Alpes-de-Haute-Provence', 'des Alpes-de-Haute-Provence'], '05': ['dans les Hautes-Alpes', 'des Hautes-Alpes'],
  '06': ['dans les Alpes-Maritimes', 'des Alpes-Maritimes'], '07': ['en Ardèche', "de l'Ardèche"], '08': ['dans les Ardennes', 'des Ardennes'],
  '09': ['en Ariège', "de l'Ariège"], '10': ["dans l'Aube", "de l'Aube"], '11': ["dans l'Aude", "de l'Aude"], '12': ["dans l'Aveyron", "de l'Aveyron"],
  '13': ['dans les Bouches-du-Rhône', 'des Bouches-du-Rhône'], '14': ['dans le Calvados', 'du Calvados'], '15': ['dans le Cantal', 'du Cantal'],
  '16': ['en Charente', 'de la Charente'], '17': ['en Charente-Maritime', 'de la Charente-Maritime'], '18': ['dans le Cher', 'du Cher'],
  '19': ['en Corrèze', 'de la Corrèze'], '21': ["en Côte-d'Or", "de la Côte-d'Or"], '22': ["dans les Côtes-d'Armor", "des Côtes-d'Armor"],
  '23': ['dans la Creuse', 'de la Creuse'], '24': ['en Dordogne', 'de la Dordogne'], '25': ['dans le Doubs', 'du Doubs'], '26': ['dans la Drôme', 'de la Drôme'],
  '27': ["dans l'Eure", "de l'Eure"], '28': ['en Eure-et-Loir', "d'Eure-et-Loir"], '29': ['dans le Finistère', 'du Finistère'],
  '2A': ['en Corse-du-Sud', 'de Corse-du-Sud'], '2B': ['en Haute-Corse', 'de Haute-Corse'], '30': ['dans le Gard', 'du Gard'],
  '31': ['en Haute-Garonne', 'de la Haute-Garonne'], '32': ['dans le Gers', 'du Gers'], '33': ['en Gironde', 'de la Gironde'], '34': ["dans l'Hérault", "de l'Hérault"],
  '35': ['en Ille-et-Vilaine', "d'Ille-et-Vilaine"], '36': ["dans l'Indre", "de l'Indre"], '37': ['en Indre-et-Loire', "d'Indre-et-Loire"], '38': ['en Isère', "de l'Isère"],
  '39': ['dans le Jura', 'du Jura'], '40': ['dans les Landes', 'des Landes'], '41': ['en Loir-et-Cher', 'du Loir-et-Cher'], '42': ['dans la Loire', 'de la Loire'],
  '43': ['en Haute-Loire', 'de la Haute-Loire'], '44': ['en Loire-Atlantique', 'de la Loire-Atlantique'], '45': ['dans le Loiret', 'du Loiret'], '46': ['dans le Lot', 'du Lot'],
  '47': ['en Lot-et-Garonne', 'du Lot-et-Garonne'], '48': ['en Lozère', 'de la Lozère'], '49': ['en Maine-et-Loire', 'du Maine-et-Loire'], '50': ['dans la Manche', 'de la Manche'],
  '51': ['dans la Marne', 'de la Marne'], '52': ['en Haute-Marne', 'de la Haute-Marne'], '53': ['en Mayenne', 'de la Mayenne'], '54': ['en Meurthe-et-Moselle', 'de Meurthe-et-Moselle'],
  '55': ['dans la Meuse', 'de la Meuse'], '56': ['dans le Morbihan', 'du Morbihan'], '57': ['en Moselle', 'de la Moselle'], '58': ['dans la Nièvre', 'de la Nièvre'],
  '59': ['dans le Nord', 'du Nord'], '60': ["dans l'Oise", "de l'Oise"], '61': ["dans l'Orne", "de l'Orne"], '62': ['dans le Pas-de-Calais', 'du Pas-de-Calais'],
  '63': ['dans le Puy-de-Dôme', 'du Puy-de-Dôme'], '64': ['dans les Pyrénées-Atlantiques', 'des Pyrénées-Atlantiques'], '65': ['dans les Hautes-Pyrénées', 'des Hautes-Pyrénées'],
  '66': ['dans les Pyrénées-Orientales', 'des Pyrénées-Orientales'], '67': ['dans le Bas-Rhin', 'du Bas-Rhin'], '68': ['dans le Haut-Rhin', 'du Haut-Rhin'], '69': ['dans le Rhône', 'du Rhône'],
  '70': ['en Haute-Saône', 'de la Haute-Saône'], '71': ['en Saône-et-Loire', 'de Saône-et-Loire'], '72': ['dans la Sarthe', 'de la Sarthe'], '73': ['en Savoie', 'de la Savoie'],
  '74': ['en Haute-Savoie', 'de la Haute-Savoie'], '75': ['à Paris', 'de Paris'], '76': ['en Seine-Maritime', 'de la Seine-Maritime'], '77': ['en Seine-et-Marne', 'de Seine-et-Marne'],
  '78': ['dans les Yvelines', 'des Yvelines'], '79': ['dans les Deux-Sèvres', 'des Deux-Sèvres'], '80': ['dans la Somme', 'de la Somme'], '81': ['dans le Tarn', 'du Tarn'],
  '82': ['en Tarn-et-Garonne', 'du Tarn-et-Garonne'], '83': ['dans le Var', 'du Var'], '84': ['dans le Vaucluse', 'du Vaucluse'], '85': ['en Vendée', 'de la Vendée'],
  '86': ['dans la Vienne', 'de la Vienne'], '87': ['en Haute-Vienne', 'de la Haute-Vienne'], '88': ['dans les Vosges', 'des Vosges'], '89': ["dans l'Yonne", "de l'Yonne"],
  '90': ['dans le Territoire de Belfort', 'du Territoire de Belfort'], '91': ["dans l'Essonne", "de l'Essonne"], '92': ['dans les Hauts-de-Seine', 'des Hauts-de-Seine'],
  '93': ['en Seine-Saint-Denis', 'de la Seine-Saint-Denis'], '94': ['dans le Val-de-Marne', 'du Val-de-Marne'], '95': ["dans le Val-d'Oise", "du Val-d'Oise"],
  '971': ['en Guadeloupe', 'de la Guadeloupe'], '972': ['en Martinique', 'de la Martinique'], '973': ['en Guyane', 'de la Guyane'], '974': ['à La Réunion', 'de La Réunion'], '976': ['à Mayotte', 'de Mayotte'],
};
/** « dans le Rhône » */
export const dansDep = (code: string) => L[code]?.[0] ?? code;
/** « du Rhône » */
export const deDep = (code: string) => L[code]?.[1] ?? code;
const R: Record<string, [string, string]> = {
  '01': ['en Guadeloupe', 'de la Guadeloupe'], '02': ['en Martinique', 'de la Martinique'], '03': ['en Guyane', 'de la Guyane'], '04': ['à La Réunion', 'de La Réunion'],
  '06': ['à Mayotte', 'de Mayotte'], '11': ['en Île-de-France', "d'Île-de-France"], '24': ['en Centre-Val de Loire', 'du Centre-Val de Loire'],
  '27': ['en Bourgogne-Franche-Comté', 'de Bourgogne-Franche-Comté'], '28': ['en Normandie', 'de Normandie'], '32': ['dans les Hauts-de-France', 'des Hauts-de-France'],
  '44': ['dans le Grand Est', 'du Grand Est'], '52': ['dans les Pays de la Loire', 'des Pays de la Loire'], '53': ['en Bretagne', 'de Bretagne'],
  '75': ['en Nouvelle-Aquitaine', 'de Nouvelle-Aquitaine'], '76': ['en Occitanie', "d'Occitanie"], '84': ['en Auvergne-Rhône-Alpes', "d'Auvergne-Rhône-Alpes"],
  '93': ["en Provence-Alpes-Côte d'Azur", "de Provence-Alpes-Côte d'Azur"], '94': ['en Corse', 'de Corse'],
};
export const dansReg = (code: string | null) => (code ? R[code]?.[0] : '') ?? '';
export const deReg = (code: string | null) => (code ? R[code]?.[1] : '') ?? '';
/** Nom affiché d'une région (la source écrit « Ile-de-France » sans accent). */
export const regLabel = (name: string) => name.replace(/^Ile-de-France$/, 'Île-de-France');
