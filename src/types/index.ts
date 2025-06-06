// 基本エンティティ型
export interface Contract {
  id: string;
  client: {
    id: string;
    name: string;
    department: string;
  };
  plan: {
    id: string;
    name: string;
  };
  price: number;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  status: string;
  contact_name: string;
  contact_email: string;
}

export interface Client {
  id: string;
  name: string;
  legal_type: string;
  legal_position: string;
  department: string;
  default_contact_name: string;
  default_contact_email: string;
  payment_method: string;
  first_contract_date: string | null;
}

// 契約ページで使用する簡易Client型
export interface SimpleClient {
  id: string;
  name: string;
  department: string;
}

export interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  duration_months: number;
}

// フォームデータ型
export interface ContractFormData {
  client_id: string;
  plan_id: string;
  price: number;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  status: string;
  contact_name: string;
  contact_email: string;
}

export interface ClientFormData {
  name: string;
  legal_type: string;
  legal_position: string;
  department: string;
  default_contact_name: string;
  default_contact_email: string;
  payment_method: string;
}

export interface PlanFormData {
  name: string;
  price_monthly: number;
  price_yearly: number;
  duration_months: number;
}

// ソート・フィルタ型
export type SortOrder = 'asc' | 'desc';

export type ContractSortField = 'client.name' | 'plan.name' | 'start_date' | 'status';
export type ClientSortField = 'name' | 'first_contract_date';

export interface FilterData {
  clientId: string;
  planId: string;
  status: string;
  startDateFrom: string;
  startDateTo: string;
}

// 定数
export const statusOptions = [
  { value: 'active', label: '有効' },
  { value: 'pending', label: '準備中' },
  { value: 'expired', label: '期限切れ' },
] as const;

export const legalTypeOptions = [
  { value: '株式会社', label: '株式会社' },
  { value: '有限会社', label: '有限会社' },
  { value: '合同会社', label: '合同会社' },
  { value: '一般社団法人', label: '一般社団法人' },
  { value: '財団法人', label: '財団法人' },
  { value: 'その他', label: 'その他' },
] as const;

export const legalPositionOptions = [
  { value: '前株', label: '前株' },
  { value: '後株', label: '後株' },
] as const;

export const paymentMethodOptions = [
  { value: 'invoice', label: '請求書払い' },
  { value: 'stripe', label: 'Stripe' },
] as const; 