const performList = async (z, bundle) => {
  const since =
    bundle.meta.timestamp ??
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const response = await z.request({
    url: `${bundle.authData.base_url}/zapier-alerts`,
    method: "GET",
    headers: {
      "X-Api-Key": bundle.authData.api_key,
    },
    params: { since },
  });

  return response.data.data ?? [];
};

const subscribeHook = async (z, bundle) => {
  const response = await z.request({
    url: `${bundle.authData.base_url}/zapier-hooks`,
    method: "POST",
    headers: {
      "X-Api-Key": bundle.authData.api_key,
      "Content-Type": "application/json",
    },
    body: {
      eventType: "alert.created",
      targetUrl: bundle.targetUrl,
    },
  });

  return response.data;
};

const unsubscribeHook = async (z, bundle) => {
  await z.request({
    url: `${bundle.authData.base_url}/zapier-hooks`,
    method: "DELETE",
    headers: {
      "X-Api-Key": bundle.authData.api_key,
      "Content-Type": "application/json",
    },
    body: {
      eventType: "alert.created",
      targetUrl: bundle.subscribeData?.targetUrl ?? bundle.targetUrl,
    },
  });

  return {};
};

const perform = async (z, bundle) => {
  return [bundle.cleanedRequest.data];
};

module.exports = {
  key: "new_alert",
  noun: "Alert",
  display: {
    label: "New Alert",
    description: "Triggers when Meduso creates a new recovery alert.",
  },
  operation: {
    type: "hook",
    perform,
    performList,
    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,
    sample: {
      id: "00000000-0000-0000-0000-000000000001",
      type: "NEGATIVE_SENTIMENT",
      severity: "HIGH",
      status: "OPEN",
      summary: "Customer frustrated by long wait time.",
      recommended_action: "Call within 24 hours to apologize.",
      conversation_id: "00000000-0000-0000-0000-000000000002",
      customer_id: "00000000-0000-0000-0000-000000000003",
      created_at: new Date().toISOString(),
    },
  },
};
