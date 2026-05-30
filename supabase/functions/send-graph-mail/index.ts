import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type SendGraphMailPayload = {
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

async function getGraphAccessToken(): Promise<string> {
  const tenantId = assertEnv('MS_TENANT_ID');
  const clientId = assertEnv('MS_CLIENT_ID');
  const clientSecret = assertEnv('MS_CLIENT_SECRET');

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const tokenResponse = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenParams.toString(),
  });

  const tokenData = await tokenResponse.json().catch(() => null) as { access_token?: string; error_description?: string } | null;

  if (!tokenResponse.ok || !tokenData?.access_token) {
    throw new Error(tokenData?.error_description || 'Unable to acquire Microsoft Graph token');
  }

  return tokenData.access_token;
}

async function sendMailThroughGraph(payload: SendGraphMailPayload): Promise<{ status: number; requestId: string | null; clientRequestId: string | null; sender: string; recipients: string[] }> {
  const senderUpn = assertEnv('MS_SENDER_UPN');
  const accessToken = await getGraphAccessToken();

  const recipients = normalizeEmails(payload.to);
  const toRecipients = recipients.map((email) => ({
    emailAddress: { address: email },
  }));

  if (toRecipients.length === 0) {
    throw new Error('No valid recipients');
  }

  console.log('[send-graph-mail] sending', {
    sender: senderUpn,
    recipients,
    subject: String(payload.subject || '').trim(),
  });

  const graphResponse = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(senderUpn)}/sendMail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        subject: String(payload.subject || '').trim(),
        body: {
          contentType: 'Text',
          content: String(payload.body || ''),
        },
        toRecipients,
      },
      saveToSentItems: true,
    }),
  });

  const requestId = graphResponse.headers.get('request-id');
  const clientRequestId = graphResponse.headers.get('client-request-id');

  if (!graphResponse.ok) {
    const errorBody = await graphResponse.text();
    console.error('[send-graph-mail] graph error', {
      status: graphResponse.status,
      requestId,
      clientRequestId,
      body: errorBody,
    });
    throw new Error(errorBody || `Graph sendMail failed (${graphResponse.status})`);
  }

  console.log('[send-graph-mail] graph accepted', {
    status: graphResponse.status,
    requestId,
    clientRequestId,
    sender: senderUpn,
    recipients,
  });

  return {
    status: graphResponse.status,
    requestId,
    clientRequestId,
    sender: senderUpn,
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

    const payload = (await req.json()) as SendGraphMailPayload;
    if (!payload || !Array.isArray(payload.to) || !payload.subject || !payload.body) {
      return jsonResponse({ error: 'Invalid payload' }, 400);
    }

    const result = await sendMailThroughGraph(payload);

    return jsonResponse({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Unauthorized' ? 401 : message === 'Forbidden' ? 403 : 500;
    return jsonResponse({ error: message }, status);
  }
});
