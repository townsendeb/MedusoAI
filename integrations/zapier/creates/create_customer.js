const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${bundle.authData.base_url}/customers`,
    method: "POST",
    headers: {
      "X-Api-Key": bundle.authData.api_key,
      "Content-Type": "application/json",
      "Idempotency-Key": bundle.inputData.external_id || undefined,
    },
    body: {
      name: bundle.inputData.name,
      phone: bundle.inputData.phone,
      email: bundle.inputData.email || null,
      visitDate: bundle.inputData.visit_date || null,
      location: bundle.inputData.location || null,
      externalId: bundle.inputData.external_id || null,
    },
  });

  return response.data.data;
};

module.exports = {
  key: "create_customer",
  noun: "Customer",
  display: {
    label: "Create Customer",
    description: "Creates a customer and schedules outreach.",
  },
  operation: {
    inputFields: [
      { key: "name", label: "Name", required: true, type: "string" },
      { key: "phone", label: "Phone (E.164 or US)", required: true, type: "string" },
      { key: "email", label: "Email", required: false, type: "string" },
      { key: "visit_date", label: "Visit Date (YYYY-MM-DD)", required: false, type: "string" },
      { key: "location", label: "Location", required: false, type: "string" },
      { key: "external_id", label: "External ID", required: false, type: "string" },
    ],
    perform,
    sample: {
      id: "00000000-0000-0000-0000-000000000099",
      name: "Jane Doe",
      phone_e164: "+15551234567",
      source: "API",
    },
  },
};
