const perform = async (z, bundle) => {
  const response = await z.request({
    url: `${bundle.authData.base_url}/outreach-voice`,
    method: "POST",
    headers: {
      "X-Api-Key": bundle.authData.api_key,
      "Content-Type": "application/json",
    },
    body: {
      customerId: bundle.inputData.customer_id,
    },
  });

  return response.data;
};

module.exports = {
  key: "trigger_voice_call",
  noun: "Voice Call",
  display: {
    label: "Trigger Voice Call",
    description: "Starts a Retell AI outbound call for a customer.",
  },
  operation: {
    inputFields: [
      {
        key: "customer_id",
        label: "Customer ID",
        required: true,
        type: "string",
        helpText: "Meduso customer UUID.",
      },
    ],
    perform,
    sample: {
      ok: true,
    },
  },
};
