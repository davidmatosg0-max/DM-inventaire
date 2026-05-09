import { getSupabaseAnonKey, getSupabaseClient, getSupabaseFunctionUrl, isSupabaseAuthEnabled } from './supabaseClient';

export type RemotePRSReportParams = {
  startDate?: string;
  endDate?: string;
  organismId?: string;
  participantPRSId?: string;
  donorId?: string;
  format?: 'json' | 'csv';
};

function buildQuery(params: RemotePRSReportParams): string {
  const searchParams = new URLSearchParams();

  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  if (params.organismId) searchParams.set('organismId', params.organismId);
  if (params.participantPRSId) searchParams.set('participantPRSId', params.participantPRSId);
  if (params.donorId) searchParams.set('donorId', params.donorId);
  if (params.format) searchParams.set('format', params.format);

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export async function obtenerReportePRSRemoto(params: RemotePRSReportParams = {}): Promise<unknown | null> {
  if (!isSupabaseAuthEnabled()) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session?.access_token) {
    return null;
  }

  const response = await fetch(`${getSupabaseFunctionUrl('reports-prs')}${buildQuery(params)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: getSupabaseAnonKey(),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error((data as { error?: string } | null)?.error || `Error ${response.status}`);
  }

  if (params.format === 'csv') {
    return response.text();
  }

  return response.json();
}