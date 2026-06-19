export type TelephonyProvider = "agentphone" | "legacy";

export type OutboundSmsResult = {
  providerMessageId: string;
  status: string;
  stub: boolean;
};

export type OutboundCallResult = {
  callId: string;
  stub: boolean;
};

export type PlaceOutboundCallInput = {
  toNumber: string;
  businessName: string;
  customerName: string;
  metadata?: Record<string, string>;
};

export type InboundSmsEvent = {
  providerMessageId: string;
  fromE164: string;
  body: string;
};
