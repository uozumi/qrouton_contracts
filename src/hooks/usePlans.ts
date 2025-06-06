import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Plan, PlanFormData } from '../types';

export const usePlans = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price_yearly');

      if (error) throw error;
      setPlans(data || []);
      return data || [];
    } catch (error) {
      console.error('プラン情報の取得に失敗しました:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlan = useCallback(async (id: string, formData: PlanFormData) => {
    try {
      const { error } = await supabase
        .from('plans')
        .update(formData)
        .eq('id', id);
      
      if (error) throw error;
      await fetchPlans();
    } catch (error) {
      console.error('プラン情報の保存に失敗しました:', error);
      throw error;
    }
  }, [fetchPlans]);

  return {
    plans,
    loading,
    fetchPlans,
    updatePlan
  };
}; 