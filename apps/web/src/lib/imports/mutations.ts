import { createClient } from "@/lib/supabase/client";

export async function uploadAndImportCustomers(
  organizationId: string,
  file: File,
): Promise<{ importId: string }> {
  const supabase = createClient();
  const importId = crypto.randomUUID();
  const storagePath = `${organizationId}/${importId}.csv`;

  const { error: uploadError } = await supabase.storage.from("imports").upload(storagePath, file, {
    contentType: file.type || "text/csv",
    upsert: false,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase.functions.invoke("import", {
    body: {
      storagePath,
      fileName: file.name,
    },
  });

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(typeof data.error === "string" ? data.error : "Import failed");
  }

  return { importId: data.importId as string };
}
