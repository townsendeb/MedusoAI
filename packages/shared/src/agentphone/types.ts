export type AgentPhoneConfig = {
  apiKey: string;
  agentId: string;
  numberId?: string;
};

export type SendAgentPhoneMessageInput = {
  to: string;
  body: string;
  agentId?: string;
  numberId?: string;
};

export type SendAgentPhoneMessageResult = {
  providerMessageId: string;
  status: string;
  stub: boolean;
};

export type CreateAgentPhoneCallInput = {
  toNumber: string;
  systemPrompt: string;
  initialGreeting?: string;
  agentId?: string;
  fromNumberId?: string;
  metadata?: Record<string, string>;
};

export type CreateAgentPhoneCallResult = {
  callId: string;
  stub: boolean;
};

export type AgentPhoneMessageWebhookData = {
  conversationId?: string;
  numberId?: string;
  from?: string;
  to?: string;
  message?: string;
  mediaUrl?: string | null;
  direction?: string;
  receivedAt?: string;
};

export type AgentPhoneCallEndedTranscriptLine = {
  role: string;
  content: string;
};

export type AgentPhoneCallEndedWebhookData = {
  callId?: string;
  numberId?: string;
  from?: string;
  to?: string;
  direction?: string;
  status?: string;
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  transcript?: AgentPhoneCallEndedTranscriptLine[] | string;
  summary?: string;
  userSentiment?: string;
  callSuccessful?: boolean;
};

export type AgentPhoneWebhookPayload = {
  event?: string;
  channel?: string;
  timestamp?: string;
  agentId?: string;
  data?: AgentPhoneMessageWebhookData | AgentPhoneCallEndedWebhookData;
};
