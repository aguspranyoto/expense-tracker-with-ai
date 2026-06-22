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

    // Call Supabase Edge Function instead of AI directly
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      const functionUrl = `${supabaseUrl}/functions/v1/ai-extract`;
      
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ image }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Edge Function error: ${response.status} - ${errText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to process receipt via Edge Function");
      }

      const extraction: ReceiptExtraction = result.data;
      return Response.json({ success: true, data: extraction });
    }

    // Mock response for development if Supabase env vars are missing
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
