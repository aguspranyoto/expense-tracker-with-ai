import { type ReceiptExtraction } from "@/lib/constants";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as string | null;

    if (!image) {
      return Response.json(
        { error: "No image provided" },
        { status: 400 }
      );
    }

    // If AI_API_URL and AI_API_KEY are set, call the real AI
    const apiUrl = process.env.AI_API_URL;
    const apiKey = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL || "xiaomi-mimo-v2.5";

    if (apiUrl && apiKey) {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
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
        throw new Error(`AI API error: ${response.status} - ${errText}`);
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

      // Pastikan deskripsi menjadi string agar sesuai dengan Prisma schema
      if (parsed.deskripsi && typeof parsed.deskripsi !== "string") {
        parsed.deskripsi = JSON.stringify(parsed.deskripsi);
      }

      const extraction: ReceiptExtraction = parsed;

      return Response.json({ success: true, data: extraction });
    }

    // Mock response for development without AI API
    const mockData: ReceiptExtraction = {
      kategori: "kopi",
      deskripsi: JSON.stringify([{"Kopi Latte": 25000}, {"Croissant": 20000}]),
      metode_pembayaran: "qris",
      jumlah: 45000,
    };

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return Response.json({ success: true, data: mockData });
  } catch (error) {
    console.error("AI processing error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to process receipt" },
      { status: 500 }
    );
  }
}
