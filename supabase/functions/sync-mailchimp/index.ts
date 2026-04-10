const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
    if (!MAILCHIMP_API_KEY) {
      throw new Error("MAILCHIMP_API_KEY is not configured");
    }

    const MAILCHIMP_AUDIENCE_ID = Deno.env.get("MAILCHIMP_AUDIENCE_ID");
    if (!MAILCHIMP_AUDIENCE_ID) {
      throw new Error("MAILCHIMP_AUDIENCE_ID is not configured");
    }

    // Extract data center from API key (e.g., "us1" from "xxx-us1")
    const dc = MAILCHIMP_API_KEY.split("-").pop();
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MAILCHIMP_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        tags: ["website-gate"],
      }),
    });

    const data = await response.json();

    // 400 with "Member Exists" is not a real error
    if (!response.ok && data.title !== "Member Exists") {
      console.error("Mailchimp API error:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Failed to sync with Mailchimp", detail: data.title }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in sync-mailchimp:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
