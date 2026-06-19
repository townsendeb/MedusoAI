import { analyzeConversationJob } from "./analyze-conversation";
import { initiateVoiceCall } from "./initiate-voice-call";
import { checkConversationTimeout } from "./check-conversation-timeout";
import { createAlerts } from "./create-alerts";
import { endConversationOnMaxTurns } from "./end-conversation-on-max-turns";
import { parseCustomerImport } from "./parse-customer-import";
import { ping } from "./ping";
import { scheduleOutreach } from "./schedule-outreach";
import { sendInitialSms } from "./send-initial-sms";
import { zapierDispatch } from "./zapier-dispatch";

export const inngestFunctions = [
  ping,
  parseCustomerImport,
  scheduleOutreach,
  sendInitialSms,
  checkConversationTimeout,
  endConversationOnMaxTurns,
  analyzeConversationJob,
  createAlerts,
  initiateVoiceCall,
  zapierDispatch,
];
