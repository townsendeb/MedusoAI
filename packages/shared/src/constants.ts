export const MEDUSO_APP_NAME = "Meduso AI";

export const DEFAULT_TIMEZONE = "America/New_York";

export const DEFAULT_SMS_DELAY_HOURS = 24;

export const DEFAULT_MAX_SMS_TURNS = 6;

/** Auto-complete SMS conversation if the customer does not reply within this window. */
export const CONVERSATION_TIMEOUT_HOURS = 2;

export const OPT_OUT_KEYWORDS = ["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"] as const;

/** Public API rate limits (see architecture plan). */
export const API_KEY_RATE_LIMIT_PER_MINUTE = 100;
export const IMPORT_RATE_LIMIT_PER_HOUR = 10;
