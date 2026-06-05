import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace('Bearer ', '');
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify caller is admin
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid auth' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roleRow } = await admin.from('user_roles').select('role').eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Admin only' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { urls } = await req.json() as { urls: string[] };
    if (!Array.isArray(urls)) {
      return new Response(JSON.stringify({ error: 'urls required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const hosted: string[] = [];
    for (const raw of urls.slice(0, 10)) {
      try {
        let u = String(raw).trim();
        if (!u) continue;
        if (u.startsWith('//')) u = 'https:' + u;
        if (!/^https?:\/\//i.test(u)) continue;
        const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!r.ok) continue;
        const ct = r.headers.get('content-type') || 'image/jpeg';
        if (!ct.startsWith('image/')) continue;
        const ext = (ct.split('/')[1] || 'jpg').split(';')[0].replace('jpeg', 'jpg');
        const buf = new Uint8Array(await r.arrayBuffer());
        const path = `imported/${userData.user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await admin.storage.from('review-photos').upload(path, buf, { contentType: ct, upsert: false });
        if (upErr) continue;
        const { data: pub } = admin.storage.from('review-photos').getPublicUrl(path);
        hosted.push(pub.publicUrl);
      } catch (_e) { /* skip */ }
    }

    return new Response(JSON.stringify({ hosted }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});