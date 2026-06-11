export type SmsTemplateVariables = {
  name: string;
  businessName: string;
};

export function renderSmsTemplate(
  template: string,
  variables: SmsTemplateVariables,
): string {
  return template
    .replaceAll("{{name}}", variables.name)
    .replaceAll("{{businessName}}", variables.businessName);
}
