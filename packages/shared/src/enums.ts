export const USER_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SUBSCRIPTION_PLANS = ["FREE", "STARTER", "GROWTH", "ENTERPRISE"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIPTION_STATUSES = [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const CUSTOMER_SOURCES = ["CSV", "API", "ZAPIER", "MANUAL"] as const;
export type CustomerSource = (typeof CUSTOMER_SOURCES)[number];

export const IMPORT_SOURCES = ["CSV", "API", "ZAPIER"] as const;
export type ImportSource = (typeof IMPORT_SOURCES)[number];

export const IMPORT_STATUSES = ["PROCESSING", "COMPLETED", "FAILED"] as const;
export type ImportStatus = (typeof IMPORT_STATUSES)[number];

export const CONVERSATION_CHANNELS = ["SMS", "VOICE"] as const;
export type ConversationChannel = (typeof CONVERSATION_CHANNELS)[number];

export const CONVERSATION_STATUSES = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
  "OPTED_OUT",
] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const RECOVERY_STATUSES = [
  "OPEN",
  "IN_RECOVERY",
  "RECOVERED",
  "RESOLVED",
  "LOST",
] as const;
export type RecoveryStatus = (typeof RECOVERY_STATUSES)[number];

export const MESSAGE_ROLES = ["SYSTEM", "ASSISTANT", "CUSTOMER"] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

export const CHURN_RISKS = ["LOW", "MEDIUM", "HIGH"] as const;
export type ChurnRisk = (typeof CHURN_RISKS)[number];

export const ALERT_TYPES = [
  "NEGATIVE_SENTIMENT",
  "HIGH_CHURN_RISK",
  "ESCALATION_REQUESTED",
] as const;
export type AlertType = (typeof ALERT_TYPES)[number];

export const ALERT_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export const ALERT_STATUSES = ["OPEN", "ACKNOWLEDGED", "RESOLVED"] as const;
export type AlertStatus = (typeof ALERT_STATUSES)[number];

export const RECOVERY_ACTION_TYPES = [
  "NOTE",
  "MARK_RECOVERED",
  "MARK_RESOLVED",
  "CONTACT_CUSTOMER",
] as const;
export type RecoveryActionType = (typeof RECOVERY_ACTION_TYPES)[number];

export const WEBHOOK_PROVIDERS = ["TWILIO", "RETELL", "STRIPE"] as const;
export type WebhookProvider = (typeof WEBHOOK_PROVIDERS)[number];

export const API_KEY_SCOPES = ["customers:read", "customers:write"] as const;
export type ApiKeyScope = (typeof API_KEY_SCOPES)[number];
