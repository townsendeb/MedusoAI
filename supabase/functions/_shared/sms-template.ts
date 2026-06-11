export function renderSmsTemplate(
  template: string,
  variables: { name: string; businessName: string },
): string {
  return template
    .replaceAll("{{name}}", variables.name)
    .replaceAll("{{businessName}}", variables.businessName);
}
