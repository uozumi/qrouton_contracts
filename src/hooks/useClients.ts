import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Client, ClientFormData } from '../types';

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          contracts!inner(start_date)
        `)
        .order('name');

      if (error) throw error;

      const processedClients = data?.map((client: any) => ({
        ...client,
        first_contract_date: client.contracts?.length > 0 
          ? client.contracts.reduce((earliest: string, contract: any) => 
              new Date(contract.start_date) < new Date(earliest) ? contract.start_date : earliest
            , client.contracts[0].start_date)
          : null
      })) || [];

      setClients(processedClients);
    } catch (error) {
      console.error('クライアント情報の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSimpleClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, department')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('クライアント情報の取得に失敗しました:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = useCallback(async (formData: ClientFormData) => {
    try {
      const { error } = await supabase
        .from('clients')
        .insert([formData]);
      
      if (error) throw error;
      await fetchClients();
    } catch (error) {
      console.error('クライアント情報の作成に失敗しました:', error);
      throw error;
    }
  }, [fetchClients]);

  const updateClient = useCallback(async (id: string, formData: ClientFormData) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(formData)
        .eq('id', id);
      
      if (error) throw error;
      await fetchClients();
    } catch (error) {
      console.error('クライアント情報の更新に失敗しました:', error);
      throw error;
    }
  }, [fetchClients]);

  return {
    clients,
    loading,
    fetchClients,
    fetchSimpleClients,
    createClient,
    updateClient
  };
}; 