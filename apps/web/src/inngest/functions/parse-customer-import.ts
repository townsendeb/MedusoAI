import { normalizePhoneE164 } from "@/lib/format";
import { parseCustomerCsv } from "@/lib/imports/csv";
import { checkUsageAllowed, incrementUsage } from "@/lib/billing/usage";
import { emitCustomerCreated } from "@/lib/inngest/events";
import { getServiceClient } from "@/lib/supabase/service";
import { inngest } from "../client";

export const parseCustomerImport = inngest.createFunction(
  { id: "parse-customer-import", name: "Parse customer import", triggers: [{ event: "customer/import.parse" }] },
  async ({ event, step }) => {
    const { importId, organizationId, storagePath } = event.data as {
      importId: string;
      organizationId: string;
      storagePath: string;
    };

    const result = await step.run("parse-and-import", async () => {
      const supabase = getServiceClient();

      const { data: file, error: downloadError } = await supabase.storage
        .from("imports")
        .download(storagePath);

      if (downloadError || !file) {
        await supabase
          .from("customer_imports")
          .update({
            status: "FAILED",
            error_report: { message: downloadError?.message ?? "File not found" },
          })
          .eq("id", importId);
        throw downloadError ?? new Error("File not found");
      }

      const csvText = await file.text();
      const { rows, errors: parseErrors } = parseCustomerCsv(csvText);

      let successRows = 0;
      let failedRows = 0;
      const rowErrors: { row: number; error: string }[] = parseErrors.map((error, index) => ({
        row: index + 1,
        error,
      }));

      let usageLimitReached = false;

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];

        if (usageLimitReached) {
          failedRows++;
          rowErrors.push({
            row: index + 2,
            error: "Monthly customer import limit reached — upgrade your plan",
          });
          continue;
        }

        const phoneE164 = normalizePhoneE164(row.phone);

        const { data: existing } = await supabase
          .from("customers")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("phone_e164", phoneE164)
          .is("deleted_at", null)
          .maybeSingle();

        if (existing) {
          failedRows++;
          rowErrors.push({
            row: index + 2,
            error: `Duplicate phone: ${phoneE164}`,
          });
          continue;
        }

        const usage = await checkUsageAllowed(organizationId, "customers_imported");
        if (!usage.allowed) {
          usageLimitReached = true;
          failedRows++;
          rowErrors.push({
            row: index + 2,
            error: "Monthly customer import limit reached — upgrade your plan",
          });
          continue;
        }

        const metadata = row.location ? { location: row.location } : {};

        const { data: customer, error: insertError } = await supabase
          .from("customers")
          .insert({
            organization_id: organizationId,
            name: row.name,
            phone_e164: phoneE164,
            email: row.email ?? null,
            last_visit_date: row.visitDate ?? null,
            metadata,
            source: "CSV",
          })
          .select("id")
          .single();

        if (insertError || !customer) {
          failedRows++;
          rowErrors.push({
            row: index + 2,
            error: insertError?.message ?? "Insert failed",
          });
          continue;
        }

        await incrementUsage(organizationId, "customers_imported");
        successRows++;

        try {
          await emitCustomerCreated({
            customerId: customer.id,
            organizationId,
          });
        } catch (eventError) {
          console.error("failed to schedule outreach for imported customer:", eventError);
        }
      }

      const totalRows = rows.length;
      const status = failedRows > 0 && successRows === 0 ? "FAILED" : "COMPLETED";

      await supabase
        .from("customer_imports")
        .update({
          status,
          total_rows: totalRows,
          success_rows: successRows,
          failed_rows: failedRows,
          error_report: rowErrors.length ? { rows: rowErrors } : null,
        })
        .eq("id", importId);

      return { importId, successRows, failedRows, totalRows, status };
    });

    if (result.successRows > 0) {
      await step.sendEvent("customers-imported", {
        name: "customer/import.completed",
        data: {
          importId: result.importId,
          organizationId,
          successRows: result.successRows,
        },
      });
    }

    return result;
  },
);
