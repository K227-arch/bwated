import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { PDFDocument } from "https://esm.sh/pdf-lib";
import { supabase } from "./supabaseClient";
 
serve(async (req) => {
  try {
    const { filePath, totalChunks } = await req.json();

    const mergedPdf = await PDFDocument.create();

    // Fetch all chunks from storage
    for (let i = 0; i < totalChunks; i++) {
      const { data, error } = await supabase.storage.from("pdfs").download(`${filePath}.part${i}`);
      if (error) return new Response(`Error fetching chunk ${i}: ${error.message}`, { status: 500 });

      const chunkPdf = await PDFDocument.load(await data.arrayBuffer());
      const copiedPages = await mergedPdf.copyPages(chunkPdf, chunkPdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    // Save merged PDF
    const finalPdfBytes = await mergedPdf.save();
    await supabase.storage.from("your-bucket-name").upload(filePath, finalPdfBytes, { upsert: true });

    // Delete chunks
    for (let i = 0; i < totalChunks; i++) {
      await supabase.storage.from("your-bucket-name").remove([`${filePath}.part${i}`]);
    }

    return new Response(JSON.stringify({ success: true, message: "PDF merged successfully" }), { status: 200 });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});
