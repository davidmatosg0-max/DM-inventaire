import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type SendMailPayload = {
  to: string[];
  subject: string;
  body: string;
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
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const requesterClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });

  return { adminClient, requesterClient };
}

async function assertAuthenticatedActiveUser(req: Request) {
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
    .select('activo')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError || !requesterProfile?.activo) {
    throw new Error('Forbidden');
  }
}

function normalizeEmails(to: string[]): string[] {
  return Array.from(
    new Set(
      (Array.isArray(to) ? to : [])
        .map((email) => String(email || '').trim())
        .filter(Boolean),
    ),
  );
}

async function sendMailThroughResend(payload: SendMailPayload): Promise<{
  status: number;
  resendId: string | null;
  sender: string;
  recipients: string[];
}> {
  const apiKey = assertEnv('RESEND_API_KEY');
  const sender = Deno.env.get('RESEND_FROM') || 'onboarding@resend.dev';
  const recipients = normalizeEmails(payload.to);

  if (recipients.length === 0) {
    throw new Error('No valid recipients');
  }

  console.log('[send-graph-mail] sending via Resend', {
    sender,
    recipients,
    subject: String(payload.subject || '').trim(),
  });

  const bodyText = String(payload.body || '');
  const bodyHtml = bodyText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: sender,
      to: recipients,
      subject: String(payload.subject || '').trim(),
      text: bodyText,
      html: bodyHtml,
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | { id?: string; message?: string; name?: string }
    | null;

  if (!response.ok) {
    console.error('[send-graph-mail] resend error', {
      status: response.status,
      data,
    });
    throw new Error(data?.message || `Resend returned ${response.status}`);
  }

  console.log('[send-graph-mail] resend accepted', {
    status: response.status,
    resendId: data?.id ?? null,
    sender,
    recipients,
  });

  return {
    status: response.status,
    resendId: data?.id ?? null,
    sender,
    recipients,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    await assertAuthenticatedActiveUser(req);

    const payload = (await req.json()) as SendMailPayload;
    if (!payload || !Array.isArray(payload.to) || !payload.subject || !payload.body) {
      return jsonResponse({ error: 'Invalid payload' }, 400);
    }

    const result = await sendMailThroughResend(payload);

    return jsonResponse({
      ok: true,
      status: result.status,
      requestId: result.resendId,
      clientRequestId: result.resendId,
      sender: result.sender,
      recipients: result.recipients,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return jsonResponse({ error: message }, status);
  }
});
