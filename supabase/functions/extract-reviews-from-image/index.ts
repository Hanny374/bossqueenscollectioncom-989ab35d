import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Verify admin
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

    const body = await req.json() as { imageDataUrl: string };
    if (!body?.imageDataUrl || !body.imageDataUrl.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: 'imageDataUrl (base64 data URL) required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const systemPrompt = `You extract customer product reviews from a screenshot of the DSers or AliExpress reviews panel. Return JSON only with shape: {"reviews":[{"reviewer_name":string,"rating":1-5 integer,"body":string}]}. Rules:
- Skip any review that has no visible text body.
- If a reviewer name is missing or anonymized, use "Verified Buyer".
- Default rating to 5 if not visible.
- Translate non-English bodies into natural English while keeping meaning.
- Do not invent reviews. Only extract what is visibly on screen.
- Return at most 20 reviews.`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all product reviews visible in this screenshot.' },
              { type: 'image_url', image_url: { url: body.imageDataUrl } },
            ],
          },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'submit_reviews',
            description: 'Submit the extracted reviews',
            parameters: {
              type: 'object',
              properties: {
                reviews: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      reviewer_name: { type: 'string' },
                      rating: { type: 'integer', minimum: 1, maximum: 5 },
                      body: { type: 'string' },
                    },
                    required: ['reviewer_name', 'rating', 'body'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['reviews'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'submit_reviews' } },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited. Try again in a moment.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Add credits in workspace settings.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'AI request failed', detail: txt }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const json = await aiRes.json();
    const call = json?.choices?.[0]?.message?.tool_calls?.[0];
    let reviews: Array<{ reviewer_name: string; rating: number; body: string }> = [];
    if (call?.function?.arguments) {
      try { reviews = JSON.parse(call.function.arguments).reviews ?? []; } catch { reviews = []; }
    }

    return new Response(JSON.stringify({ reviews }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});