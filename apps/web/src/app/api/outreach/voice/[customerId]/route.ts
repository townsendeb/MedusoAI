import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { getUserProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ customerId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const profile = await getUserProfile();

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId } = await context.params;
  const supabase = await createClient();

  const { data: customer, error } = await supabase
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("organization_id", profile.organization_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  await inngest.send({
    name: "voice/call.requested",
    data: {
      customerId: customer.id,
      organizationId: profile.organization_id,
    },
    id: `voice-call-${customer.id}-${Date.now()}`,
  });

  return NextResponse.json({ ok: true });
}
