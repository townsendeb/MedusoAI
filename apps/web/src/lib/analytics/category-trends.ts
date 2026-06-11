import { COMPLAINT_CATEGORIES, PRAISE_CATEGORIES } from "@meduso/shared";
import { createClient } from "@/lib/supabase/client";

export type CategoryTrendItem = {
  id: string;
  label: string;
  count: number;
};

export type CategoryTrends = {
  complaints: CategoryTrendItem[];
  praise: CategoryTrendItem[];
};

const complaintLabels = new Map(COMPLAINT_CATEGORIES.map((category) => [category.id, category.label]));
const praiseLabels = new Map(PRAISE_CATEGORIES.map((category) => [category.id, category.label]));

export async function fetchCategoryTrends(): Promise<CategoryTrends> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_analytics_category_trends");

  if (error) {
    throw error;
  }

  const payload = data as {
    complaints?: { id: string; count: number }[];
    praise?: { id: string; count: number }[];
  } | null;

  return {
    complaints: (payload?.complaints ?? []).map((item) => ({
      id: item.id,
      label: complaintLabels.get(item.id) ?? item.id,
      count: item.count,
    })),
    praise: (payload?.praise ?? []).map((item) => ({
      id: item.id,
      label: praiseLabels.get(item.id) ?? item.id,
      count: item.count,
    })),
  };
}
