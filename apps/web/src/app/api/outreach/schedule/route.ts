import { NextResponse } from "next/server";
import { emitCustomerCreated } from "@/lib/inngest/events";
import { getUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const profile = await getUserProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { customerId?: string };

  if (!body.customerId) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: customer, error } = await supabase
    .from("customers")
    .select("id")
    .eq("id", body.customerId)
    .eq("organization_id", profile.organization_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  await emitCustomerCreated({
    customerId: customer.id,
    organizationId: profile.organization_id,
  });

  return NextResponse.json({ ok: true });
}
