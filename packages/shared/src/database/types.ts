import type {
  AlertSeverity,
  AlertStatus,
  AlertType,
  ChurnRisk,
  ConversationChannel,
  ConversationStatus,
  CustomerSource,
  ImportSource,
  ImportStatus,
  MessageRole,
  RecoveryActionType,
  RecoveryStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  UserRole,
  WebhookProvider,
} from "../enums";

/** ISO timestamp string from Postgres timestamptz */
export type Timestamp = string;

/** ISO date string from Postgres date */
export type DateString = string;

export type OrganizationSettings = {
  defaultOutreachDelayHours: number;
  smsEnabled: boolean;
  voiceEnabled: boolean;
  avgCustomerValue: number;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  industry: string | null;
  settings: OrganizationSettings;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type Profile = {
  id: string;
  organization_id: string;
  role: UserRole;
  name: string;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type Subscription = {
  id: string;
  organization_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: Timestamp | null;
  current_period_end: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type Location = {
  id: string;
  organization_id: string;
  name: string;
  external_id: string | null;
  address: Record<string, unknown> | null;
  is_active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type OutreachSettings = {
  organization_id: string;
  sms_delay_hours: number;
  sms_template: string;
  voice_enabled: boolean;
  max_sms_turns: number;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type Customer = {
  id: string;
  organization_id: string;
  location_id: string | null;
  name: string;
  phone_e164: string;
  email: string | null;
  last_visit_date: DateString | null;
  source: CustomerSource;
  external_id: string | null;
  metadata: Record<string, unknown>;
  deleted_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type CustomerImport = {
  id: string;
  organization_id: string;
  file_name: string | null;
  source: ImportSource;
  status: ImportStatus;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  error_report: Record<string, unknown> | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type Conversation = {
  id: string;
  organization_id: string;
  customer_id: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  scheduled_at: Timestamp | null;
  started_at: Timestamp | null;
  ended_at: Timestamp | null;
  twilio_conversation_sid: string | null;
  retell_call_id: string | null;
  recording_url: string | null;
  transcript_raw: string | null;
  recovery_status: RecoveryStatus;
  provider_metadata: Record<string, unknown>;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  channel: ConversationChannel;
  provider_message_id: string | null;
  created_at: Timestamp;
};

export type ConversationAnalysis = {
  id: string;
  conversation_id: string;
  sentiment_score: number;
  satisfaction_score: number;
  churn_risk: ChurnRisk;
  complaint_categories: string[];
  praise_categories: string[];
  summary: string;
  recommended_action: string;
  model: string;
  raw_response: Record<string, unknown>;
  analyzed_at: Timestamp;
  created_at: Timestamp;
};

export type Alert = {
  id: string;
  organization_id: string;
  conversation_id: string;
  customer_id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  summary: string;
  recommended_action: string;
  acknowledged_by_user_id: string | null;
  acknowledged_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type RecoveryAction = {
  id: string;
  conversation_id: string;
  user_id: string;
  action: RecoveryActionType;
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Timestamp;
};

export type ApiKey = {
  id: string;
  organization_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes: string[];
  last_used_at: Timestamp | null;
  revoked_at: Timestamp | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type WebhookEvent = {
  id: string;
  provider: WebhookProvider;
  external_event_id: string;
  payload: Record<string, unknown>;
  processed_at: Timestamp | null;
  created_at: Timestamp;
};

export type UsageCounter = {
  id: string;
  organization_id: string;
  period: string;
  sms_sent: number;
  voice_minutes: number;
  customers_imported: number;
  created_at: Timestamp;
  updated_at: Timestamp;
};
