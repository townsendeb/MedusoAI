const performList = async (z, bundle) => {
  const since =
    bundle.meta.timestamp ??
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const response = await z.request({
    url: `${bundle.authData.base_url}/zapier-conversations`,
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
      eventType: "conversation.completed",
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
      eventType: "conversation.completed",
      targetUrl: bundle.subscribeData?.targetUrl ?? bundle.targetUrl,
    },
  });

  return {};
};

const perform = async (z, bundle) => {
  return [bundle.cleanedRequest.data];
};

module.exports = {
  key: "conversation_completed",
  noun: "Conversation",
  display: {
    label: "Conversation Completed",
    description: "Triggers when an SMS or voice conversation is completed.",
  },
  operation: {
    type: "hook",
    perform,
    performList,
    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,
    sample: {
      id: "00000000-0000-0000-0000-000000000010",
      channel: "SMS",
      status: "COMPLETED",
      recovery_status: "OPEN",
      customer_id: "00000000-0000-0000-0000-000000000003",
      ended_at: new Date().toISOString(),
    },
  },
};
