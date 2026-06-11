const testAuth = async (z, bundle) => {
  const response = await z.request({
    url: `${bundle.authData.base_url}/zapier-alerts`,
    method: "GET",
    headers: {
      "X-Api-Key": bundle.authData.api_key,
    },
    params: {
      since: "1970-01-01T00:00:00.000Z",
    },
  });

  return response.data;
};

module.exports = {
  type: "custom",
  fields: [
    {
      key: "api_key",
      label: "Meduso API Key",
      required: true,
      type: "password",
      helpText: "Create an API key in Meduso → Settings → API keys.",
    },
    {
      key: "base_url",
      label: "Supabase Functions URL",
      required: true,
      default: "https://your-project-ref.supabase.co/functions/v1",
      helpText: "Your Supabase Edge Functions base URL.",
    },
  ],
  test: testAuth,
  connectionLabel: "{{bundle.authData.api_key}}",
};
