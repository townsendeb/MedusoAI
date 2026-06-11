export const queryKeys = {
  customers: {
    all: (organizationId: string) => ["customers", organizationId] as const,
    detail: (organizationId: string, customerId: string) =>
      ["customers", organizationId, customerId] as const,
  },
  imports: {
    detail: (organizationId: string, importId: string) =>
      ["customer-imports", organizationId, importId] as const,
    processing: (organizationId: string) =>
      ["customer-imports", organizationId, "processing"] as const,
  },
  apiKeys: {
    all: (organizationId: string) => ["api-keys", organizationId] as const,
  },
  conversations: {
    all: (organizationId: string) => ["conversations", organizationId] as const,
    detail: (organizationId: string, conversationId: string) =>
      ["conversations", organizationId, conversationId] as const,
  },
  alerts: {
    all: (organizationId: string) => ["alerts", organizationId] as const,
  },
  analytics: {
    overview: (organizationId: string) => ["analytics", organizationId, "overview"] as const,
    categories: (organizationId: string) => ["analytics", organizationId, "categories"] as const,
  },
};
