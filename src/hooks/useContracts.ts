import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Contract, ContractFormData } from '../types';

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          client:clients (
            id,
            name,
            department
          ),
          plan:plans (
            id,
            name
          )
        `)
        .order('start_date');

      if (error) throw error;
      setContracts(data || []);
      return data || [];
    } catch (error) {
      console.error('契約情報の取得に失敗しました:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActiveContracts = useCallback(async (selectedMonth: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          client:clients (
            name,
            department
          ),
          plan:plans (
            name
          )
        `)
        .eq('status', 'active')
        .order('start_date');

      if (error) throw error;

      console.log(`=== fetchActiveContracts デバッグ ===`);
      console.log(`選択月: ${selectedMonth}`);
      console.log(`DB取得契約数: ${data?.length || 0}`);
      
      const domainOptionBeforeFilter = (data || []).filter(c => c.plan?.name === '独自ドメインオプション利用料');
      console.log(`期間フィルタ前のドメインオプション契約数: ${domainOptionBeforeFilter.length}`);

      // selectedMonth (例: "2025-06") を年月に分割
      const [year, month] = selectedMonth.split('-').map(Number);
      
      // 比較用に文字列で日付を作成（YYYY-MM-DD形式）
      const firstDayStr = `${year}-${month.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate(); // 当月の最終日を取得
      const lastDayStr = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

      console.log(`期間範囲: ${firstDayStr} ～ ${lastDayStr}`);

      // 選択された月の時点で有効な契約のみをフィルタリング
      const filteredContracts = (data || []).filter(contract => {
        // 文字列比較で確実に判定
        const startDate = contract.start_date;
        const endDate = contract.end_date;
        
        const isActive = startDate <= lastDayStr && endDate >= firstDayStr;
        
        // ドメインオプション契約の詳細ログ
        if (contract.plan?.name === '独自ドメインオプション利用料') {
          console.log(`ドメインオプション契約: ${startDate} ～ ${endDate} → ${isActive ? '有効' : '除外'}`);
          if (!isActive) {
            console.log(`  除外理由: startDate(${startDate}) <= lastDayStr(${lastDayStr}) = ${startDate <= lastDayStr}, endDate(${endDate}) >= firstDayStr(${firstDayStr}) = ${endDate >= firstDayStr}`);
          }
        }
        
        return isActive;
      });

      const domainOptionAfterFilter = filteredContracts.filter(c => c.plan?.name === '独自ドメインオプション利用料');
      console.log(`期間フィルタ後のドメインオプション契約数: ${domainOptionAfterFilter.length}`);
      console.log(`=== デバッグ終了 ===`);

      setContracts(filteredContracts);
      return filteredContracts;
    } catch (error) {
      console.error('契約情報の取得に失敗しました:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createContract = useCallback(async (formData: ContractFormData) => {
    try {
      if (!formData.client_id || !formData.plan_id) {
        throw new Error('クライアントとプランは必須です');
      }

      const submitData = {
        ...formData,
        price: Number(formData.price)
      };

      const { error } = await supabase
        .from('contracts')
        .insert([submitData]);
      
      if (error) throw error;
      await fetchContracts();
    } catch (error) {
      console.error('契約情報の作成に失敗しました:', error);
      throw error;
    }
  }, [fetchContracts]);

  const updateContract = useCallback(async (id: string, formData: ContractFormData) => {
    try {
      const submitData = {
        ...formData,
        price: Number(formData.price)
      };

      const { error } = await supabase
        .from('contracts')
        .update(submitData)
        .eq('id', id);
      
      if (error) throw error;
      await fetchContracts();
    } catch (error) {
      console.error('契約情報の更新に失敗しました:', error);
      throw error;
    }
  }, [fetchContracts]);

  return {
    contracts,
    loading,
    fetchContracts,
    fetchActiveContracts,
    createContract,
    updateContract
  };
}; 