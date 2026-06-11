export type TwilioConfig = {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
};

export type SendSmsInput = {
  to: string;
  body: string;
  from?: string;
};

export type SendSmsResult = {
  sid: string;
  status: string;
  stub: boolean;
};
