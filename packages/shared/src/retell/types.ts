export type RetellConfig = {
  apiKey: string;
  agentId: string;
  fromNumber: string;
};

export type CreatePhoneCallInput = {
  toNumber: string;
  fromNumber?: string;
  agentId?: string;
  metadata?: Record<string, string>;
  dynamicVariables?: Record<string, string>;
};

export type CreatePhoneCallResult = {
  callId: string;
  stub: boolean;
};

export type RetellWebhookEvent = {
  event: string;
  call?: {
    call_id?: string;
    call_type?: string;
    agent_id?: string;
    call_status?: string;
    from_number?: string;
    to_number?: string;
    direction?: string;
    start_timestamp?: number;
    end_timestamp?: number;
    transcript?: string;
    recording_url?: string;
    metadata?: Record<string, unknown>;
    disconnection_reason?: string;
  };
};
