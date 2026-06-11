export type SmsChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GenerateSmsReplyInput = {
  businessName: string;
  customerName: string;
  messages: SmsChatMessage[];
};

export type GenerateSmsReplyResult = {
  content: string;
  stub: boolean;
};
