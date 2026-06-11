import feedbackCategories from "./feedback-categories.json";

export type FeedbackCategory = {
  id: string;
  label: string;
};

export const COMPLAINT_CATEGORIES = feedbackCategories.complaints as FeedbackCategory[];
export const PRAISE_CATEGORIES = feedbackCategories.praise as FeedbackCategory[];

export const COMPLAINT_CATEGORY_IDS = COMPLAINT_CATEGORIES.map((c) => c.id);
export const PRAISE_CATEGORY_IDS = PRAISE_CATEGORIES.map((c) => c.id);
