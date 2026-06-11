/** Respects OUTREACH_DELAY_MINUTES override for local testing. */
export function getOutreachDelayDuration(delayHours: number): string {
  const overrideMinutes = process.env.OUTREACH_DELAY_MINUTES;

  if (overrideMinutes) {
    const minutes = Number.parseInt(overrideMinutes, 10);
    if (!Number.isNaN(minutes) && minutes >= 0) {
      return `${minutes}m`;
    }
  }

  return `${delayHours}h`;
}

export function getConversationTimeoutDuration(): string {
  const overrideMinutes = process.env.CONVERSATION_TIMEOUT_MINUTES;

  if (overrideMinutes) {
    const minutes = Number.parseInt(overrideMinutes, 10);
    if (!Number.isNaN(minutes) && minutes >= 0) {
      return `${minutes}m`;
    }
  }

  return "2h";
}
