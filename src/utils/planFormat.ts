interface PlanFormatProps {
  name: string;
  price?: number | null;
}

/**
 * プラン名と料金を統合した表示形式を生成する
 * @param plan - プラン情報（名前と料金）
 * @returns "{プラン名}（{料金}円/月）" 形式の文字列
 */
export const formatPlanWithPrice = (plan: PlanFormatProps): string => {
  if (!plan.price) {
    return plan.name;
  }
  
  const monthlyPrice = Math.round(plan.price / 12);
  return `${plan.name}（${monthlyPrice.toLocaleString()}円/月）`;
}; 