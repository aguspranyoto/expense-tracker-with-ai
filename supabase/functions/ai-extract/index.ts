// No external imports needed for this function

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify Authorization Header (Ensure only our Next.js backend can call this)
    // Next.js should send the SUPABASE_SERVICE_ROLE_KEY as Bearer token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 2. Parse Request Body
    const body = await req.json()
    const { image } = body

    if (!image) {
      return new Response(JSON.stringify({ error: 'No image provided' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 3. Get AI Keys from Supabase Secrets
    const apiUrl = Deno.env.get('AI_API_URL')
    const apiKey = Deno.env.get('AI_API_KEY')
    const model = Deno.env.get('AI_MODEL') || "xiaomi-mimo-v2.5"

    if (!apiUrl || !apiKey) {
      return new Response(JSON.stringify({ error: 'AI API configuration is missing' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 4. Call the AI API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `Kamu adalah asisten AI yang menganalisis gambar struk belanja. 
Ekstrak informasi berikut dan kembalikan HANYA dalam format JSON (tanpa markdown, tanpa backtick):
{
  "kategori": "kopi" | "bensin" | "makan" | "transportasi" | "belanja" | "lainnya",
  "deskripsi": [{"nama barang 1": harga1}, {"nama barang 2": harga2}],
  "metode_pembayaran": "qris" | "tunai" | "debit" | "kredit" | "transfer",
  "jumlah": angka_total_pembayaran
}

Pastikan:
- kategori dipilih yang paling tepat
- jumlah adalah angka integer tanpa titik, koma, atau simbol mata uang
- deskripsi adalah array of objects di mana key adalah nama barang dan value adalah harga barang (angka integer)`,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: image },
              },
              {
                type: "text",
                text: "Tolong analisis struk belanja ini dan ekstrak datanya.",
              },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`AI API error: ${response.status} - ${errText}`);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from the AI response
    const cleanContent = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
      
    let parsed;
    try {
      parsed = JSON.parse(cleanContent);
    } catch (err) {
      throw new Error("AI returned invalid JSON: " + cleanContent);
    }

    // Ensure description is stringified for Prisma schema
    if (parsed.deskripsi && typeof parsed.deskripsi !== "string") {
      parsed.deskripsi = JSON.stringify(parsed.deskripsi);
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to process receipt" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
