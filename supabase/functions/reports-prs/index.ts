import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

type AppStorageRow = {
  storage_key: string;
  payload: unknown;
};

type EntradaPRS = {
  id?: string;
  fecha?: string;
  programaNombre?: string;
  programaCodigo?: string;
  donadorId?: string;
  donadorNombre?: string;
  participantePRSId?: string;
  participantePRSNombre?: string;
  productoId?: string;
  nombreProducto?: string;
  cantidad?: number;
  unidad?: string;
  pesoTotal?: number;
  valorTotal?: number;
  valorUnitario?: number;
  registradoPor?: string;
  organismoId?: string;
  activo?: boolean;
};

type Organismo = {
  id?: string;
  nombre?: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function textResponse(body: string, status = 200, contentType = 'text/plain; charset=utf-8') {
  return new Response(body, {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': contentType,
    },
  });
}

function assertEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function buildClients(req: Request) {
  const supabaseUrl = assertEnv('SUPABASE_URL');
  const serviceRoleKey = assertEnv('SUPABASE_SERVICE_ROLE_KEY');
  const authHeader = req.headers.get('Authorization') || '';

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const requesterClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

  return { adminClient, requesterClient };
}

async function assertReportsAccess(req: Request) {
  const { adminClient, requesterClient } = buildClients(req);

  const {
    data: { user },
    error: authError,
  } = await requesterClient.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  const { data: requesterProfile, error: profileError } = await adminClient
    .from('auth_user_payload')
    .select('rol, permisos, activo')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError || !requesterProfile?.activo) {
    throw new Error('Forbidden');
  }

  const role = String(requesterProfile.rol || '').toLowerCase();
  const permisos = Array.isArray(requesterProfile.permisos) ? requesterProfile.permisos : [];
  const canReadReports = role === 'desarrollador'
    || role === 'administrador'
    || permisos.includes('reportes.ver')
    || permisos.includes('reportes.generar')
    || permisos.includes('reportes.exportar')
    || permisos.includes('reportes.avanzados');

  if (!canReadReports) {
    throw new Error('Forbidden');
  }

  return { adminClient };
}

function normalizeArray<T>(payload: unknown): T[] {
  return Array.isArray(payload) ? payload as T[] : [];
}

function isPRSEntry(entry: EntradaPRS): boolean {
  const code = String(entry.programaCodigo || '').trim().toLowerCase();
  const name = String(entry.programaNombre || '').trim().toLowerCase();

  return code === 'prs'
    || name.includes('prs')
    || name.includes('ramassage de surplus')
    || name.includes('récupération en supermarchés')
    || name.includes('recuperacion en supermercados');
}

function calculateEntryValue(entry: EntradaPRS): number {
  if (typeof entry.valorTotal === 'number') {
    return entry.valorTotal;
  }

  if (typeof entry.valorUnitario === 'number' && typeof entry.cantidad === 'number') {
    return entry.valorUnitario * entry.cantidad;
  }

  return 0;
}

function formatCsvValue(value: string | number): string {
  const stringValue = String(value ?? '');
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function toCsv(report: ReturnType<typeof buildReport>): string {
  const lines: string[] = [];

  lines.push('RAPPORT PRS - DM INVENTAIRE');
  lines.push(`Periode,${report.periodo.inicio} - ${report.periodo.fin}`);
  lines.push(`Genere le,${new Date(report.generadoEn).toLocaleString('fr-CA')}`);
  lines.push('');
  lines.push('=== RESUME ===');
  lines.push(`Total entrees,${report.resumen.totalEntradas}`);
  lines.push(`Total quantite,${report.resumen.totalCantidad}`);
  lines.push(`Total poids kg,${report.resumen.totalPesoKg}`);
  lines.push(`Valeur totale estimee,${report.resumen.valorTotalEstime}`);
  lines.push('');
  lines.push('=== DETAILS ===');
  lines.push('Date,Organisme,Donateur,Participant PRS,Produit,Quantite,Unite,Poids Kg,Valeur Estimee');

  report.detalles.forEach((detail) => {
    lines.push([
      detail.fecha,
      detail.organismoNombre,
      detail.donadorNombre,
      detail.participantePRSNombre,
      detail.productoNombre,
      detail.cantidad,
      detail.unidad,
      detail.pesoTotal,
      detail.valorTotalEstime,
    ].map(formatCsvValue).join(','));
  });

  return lines.join('\n');
}

function buildReport(entries: EntradaPRS[], organisms: Organismo[], filters: {
  startDate?: string;
  endDate?: string;
  organismId?: string;
  participantPRSId?: string;
  donorId?: string;
}) {
  const organismMap = new Map(
    organisms
      .filter((organism) => organism.id && organism.nombre)
      .map((organism) => [String(organism.id), String(organism.nombre)]),
  );

  let filteredEntries = entries.filter((entry) => entry.activo !== false && isPRSEntry(entry));

  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);

    filteredEntries = filteredEntries.filter((entry) => {
      const date = new Date(String(entry.fecha || ''));
      return !Number.isNaN(date.getTime()) && date >= start && date <= end;
    });
  }

  if (filters.organismId) {
    filteredEntries = filteredEntries.filter((entry) => String(entry.organismoId || '') === filters.organismId);
  }

  if (filters.participantPRSId) {
    filteredEntries = filteredEntries.filter((entry) => String(entry.participantePRSId || '') === filters.participantPRSId);
  }

  if (filters.donorId) {
    filteredEntries = filteredEntries.filter((entry) => String(entry.donadorId || '') === filters.donorId);
  }

  const byOrganism = new Map<string, {
    organismoId: string;
    organismoNombre: string;
    totalEntradas: number;
    totalCantidad: number;
    totalPesoKg: number;
    valorTotalEstime: number;
  }>();
  const byDonor = new Map<string, {
    donadorId: string;
    donadorNombre: string;
    totalEntradas: number;
    totalCantidad: number;
    totalPesoKg: number;
    valorTotalEstime: number;
  }>();
  const byProduct = new Map<string, {
    productoId: string;
    productoNombre: string;
    totalEntradas: number;
    totalCantidad: number;
    totalPesoKg: number;
    valorTotalEstime: number;
  }>();

  const uniqueDonors = new Set<string>();
  const uniqueProducts = new Set<string>();
  const uniqueOrganisms = new Set<string>();
  const uniqueParticipants = new Set<string>();

  const detalles = filteredEntries
    .map((entry) => {
      const organismoId = String(entry.organismoId || '');
      const organismoNombre = String(entry.registradoPor || organismMap.get(organismoId) || 'Sans organisme');
      const donadorId = String(entry.donadorId || '');
      const donadorNombre = String(entry.donadorNombre || 'Sans donateur');
      const participantePRSId = String(entry.participantePRSId || '');
      const participantePRSNombre = String(entry.participantePRSNombre || '');
      const productoId = String(entry.productoId || '');
      const productoNombre = String(entry.nombreProducto || 'Sans produit');
      const cantidad = Number(entry.cantidad || 0);
      const pesoTotal = Number(entry.pesoTotal || 0);
      const valorTotalEstime = calculateEntryValue(entry);

      uniqueDonors.add(donadorId || donadorNombre);
      uniqueProducts.add(productoId || productoNombre);
      uniqueOrganisms.add(organismoId || organismoNombre);
      if (participantePRSId || participantePRSNombre) {
        uniqueParticipants.add(participantePRSId || participantePRSNombre);
      }

      const organismAggregate = byOrganism.get(organismoId || organismoNombre) || {
        organismoId,
        organismoNombre,
        totalEntradas: 0,
        totalCantidad: 0,
        totalPesoKg: 0,
        valorTotalEstime: 0,
      };
      organismAggregate.totalEntradas += 1;
      organismAggregate.totalCantidad += cantidad;
      organismAggregate.totalPesoKg += pesoTotal;
      organismAggregate.valorTotalEstime += valorTotalEstime;
      byOrganism.set(organismoId || organismoNombre, organismAggregate);

      const donorAggregate = byDonor.get(donadorId || donadorNombre) || {
        donadorId,
        donadorNombre,
        totalEntradas: 0,
        totalCantidad: 0,
        totalPesoKg: 0,
        valorTotalEstime: 0,
      };
      donorAggregate.totalEntradas += 1;
      donorAggregate.totalCantidad += cantidad;
      donorAggregate.totalPesoKg += pesoTotal;
      donorAggregate.valorTotalEstime += valorTotalEstime;
      byDonor.set(donadorId || donadorNombre, donorAggregate);

      const productAggregate = byProduct.get(productoId || productoNombre) || {
        productoId,
        productoNombre,
        totalEntradas: 0,
        totalCantidad: 0,
        totalPesoKg: 0,
        valorTotalEstime: 0,
      };
      productAggregate.totalEntradas += 1;
      productAggregate.totalCantidad += cantidad;
      productAggregate.totalPesoKg += pesoTotal;
      productAggregate.valorTotalEstime += valorTotalEstime;
      byProduct.set(productoId || productoNombre, productAggregate);

      return {
        id: String(entry.id || ''),
        fecha: String(entry.fecha || ''),
        organismoId,
        organismoNombre,
        donadorId,
        donadorNombre,
        participantePRSId,
        participantePRSNombre,
        productoId,
        productoNombre,
        cantidad,
        unidad: String(entry.unidad || ''),
        pesoTotal,
        valorTotalEstime,
      };
    })
    .sort((left, right) => new Date(right.fecha).getTime() - new Date(left.fecha).getTime());

  return {
    resumen: {
      totalEntradas: filteredEntries.length,
      totalCantidad: detalles.reduce((sum, detail) => sum + detail.cantidad, 0),
      totalPesoKg: detalles.reduce((sum, detail) => sum + detail.pesoTotal, 0),
      valorTotalEstime: detalles.reduce((sum, detail) => sum + detail.valorTotalEstime, 0),
      donadoresUnicos: uniqueDonors.size,
      productosUnicos: uniqueProducts.size,
      organismosUnicos: uniqueOrganisms.size,
      participantesPRSUnicos: uniqueParticipants.size,
    },
    porOrganismo: Array.from(byOrganism.values()).sort((a, b) => b.valorTotalEstime - a.valorTotalEstime),
    porDonador: Array.from(byDonor.values()).sort((a, b) => b.valorTotalEstime - a.valorTotalEstime),
    porProducto: Array.from(byProduct.values()).sort((a, b) => b.valorTotalEstime - a.valorTotalEstime),
    detalles,
    periodo: {
      inicio: filters.startDate || 'Début des registres',
      fin: filters.endDate || 'Aujourd\'hui',
    },
    generadoEn: new Date().toISOString(),
  };
}

async function readOperationalPayloads(adminClient: ReturnType<typeof createClient>) {
  const { data, error } = await adminClient
    .from('app_storage')
    .select('storage_key, payload')
    .in('storage_key', ['banco_alimentos_entradas_inventario', 'organismos_banco_alimentos']);

  if (error) {
    throw new Error(error.message);
  }

  const rows = Array.isArray(data) ? data as AppStorageRow[] : [];
  const entriesRow = rows.find((row) => row.storage_key === 'banco_alimentos_entradas_inventario');
  const organismsRow = rows.find((row) => row.storage_key === 'organismos_banco_alimentos');

  return {
    entries: normalizeArray<EntradaPRS>(entriesRow?.payload),
    organisms: normalizeArray<Organismo>(organismsRow?.payload),
  };
}

async function handleGet(req: Request) {
  const { adminClient } = await assertReportsAccess(req);
  const url = new URL(req.url);
  const format = String(url.searchParams.get('format') || 'json').toLowerCase();

  const { entries, organisms } = await readOperationalPayloads(adminClient);
  const report = buildReport(entries, organisms, {
    startDate: url.searchParams.get('startDate') || undefined,
    endDate: url.searchParams.get('endDate') || undefined,
    organismId: url.searchParams.get('organismId') || undefined,
    participantPRSId: url.searchParams.get('participantPRSId') || undefined,
    donorId: url.searchParams.get('donorId') || undefined,
  });

  if (format === 'csv') {
    return textResponse(toCsv(report), 200, 'text/csv; charset=utf-8');
  }

  return jsonResponse(report, 200);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method === 'GET') {
      return await handleGet(req);
    }

    return jsonResponse({ error: 'Method not allowed' }, 405);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return jsonResponse({ error: message }, status);
  }
});