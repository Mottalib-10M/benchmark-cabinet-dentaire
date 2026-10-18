/**
 * Demande d'échange : une ligne dans la table public.demandes_echange de la base commune (Supabase,
 * clé publique anon, politique RLS « insertion seule »). Appel REST direct, sans bibliothèque, pour ne
 * pas alourdir la page. Seul envoi réseau du site, et seulement quand le visiteur le demande.
 */
const URL_BASE = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const CLE = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;
const SITE = (import.meta.env.PUBLIC_SITE_DOMAIN as string | undefined) ?? 'dentimetre.fr';

export interface Demande { nom: string; email: string; telephone: string | null; ville: string | null; creneau: string; rapport: unknown; lang: string }

export async function envoyerDemande(d: Demande): Promise<boolean> {
  if (!URL_BASE || !CLE) return false;
  try {
    const r = await fetch(`${URL_BASE}/rest/v1/demandes_echange`, {
      method: 'POST',
      headers: { apikey: CLE, Authorization: `Bearer ${CLE}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ site: SITE, ...d }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
