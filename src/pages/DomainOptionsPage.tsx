import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Chip
} from '@mui/material';
import { supabase } from '../lib/supabase';

interface Contract {
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
  start_date: string;
  end_date: string;
  contact_name: string;
  contact_email: string;
  status: string;
}

interface SupabaseResponse {
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
  start_date: string;
  end_date: string;
  contact_name: string;
  contact_email: string;
  status: string;
}

export const DomainOptionsPage = () => {
  console.log('DomainOptionList コンポーネントがレンダリングされました');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useEffect が実行されました');
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    console.log('fetchContracts が実行されました');
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          id,
          client:clients!client_id(
            id,
            name,
            department
          ),
          plan:plans!plan_id(
            id,
            name
          ),
          start_date,
          end_date,
          contact_name,
          contact_email,
          status
        `)
        .eq('plan.name', '独自ドメインオプション利用料')
        .eq('status', 'active')
        .order('start_date', { ascending: true });

      console.log('クエリ結果:', { data, error });

      if (error) {
        console.error('クエリエラー:', error);
        throw error;
      }

      const typedData = ((data || []) as unknown as SupabaseResponse[])
        .filter(item => item && item.client && item.plan)
        .map(item => ({
          id: item.id,
          client: {
            id: item.client.id || '',
            name: item.client.name || '',
            department: item.client.department || ''
          },
          plan: {
            id: item.plan.id || '',
            name: item.plan.name || ''
          },
          start_date: item.start_date || '',
          end_date: item.end_date || '',
          contact_name: item.contact_name || '',
          contact_email: item.contact_email || '',
          status: item.status || ''
        }));

      console.log('変換後のデータ:', typedData);
      setContracts(typedData);
    } catch (error) {
      console.error('契約情報の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthFromDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月`;
  };

  const groupContractsByMonth = () => {
    const grouped: { [key: string]: Contract[] } = {};
    
    // 1月から12月までの空の配列を初期化
    for (let i = 1; i <= 12; i++) {
      grouped[`${i}月`] = [];
    }
    
    contracts.forEach(contract => {
      const month = getMonthFromDate(contract.start_date);
      grouped[month].push(contract);
    });

    return grouped;
  };

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  const groupedContracts = groupContractsByMonth();
  const currentMonth = `${new Date().getMonth() + 1}月`;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">独自ドメインオプション利用者一覧</Typography>
      </Stack>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {Object.keys(groupedContracts).map((month) => (
                <TableCell 
                  key={month} 
                  align="center"
                  sx={{
                    bgcolor: month === currentMonth ? 'primary.main' : 'inherit',
                    color: month === currentMonth ? 'primary.contrastText' : 'inherit'
                  }}
                >
                  {month}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {Object.values(groupedContracts).map((contracts, index) => (
                <TableCell 
                  key={index} 
                  align="center"
                  sx={{
                    bgcolor: Object.keys(groupedContracts)[index] === currentMonth ? 'primary.main' : 'inherit',
                    color: Object.keys(groupedContracts)[index] === currentMonth ? 'primary.contrastText' : 'inherit'
                  }}
                >
                  {contracts.length}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {Object.entries(groupedContracts).map(([month, monthContracts]) => (
        monthContracts.length > 0 && (
          <Box key={month} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {month}（{monthContracts.length}件）
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="70%">クライアント</TableCell>
                    <TableCell width="30%" align="center">契約期間</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        {contract.client.name}
                        {contract.client.department && `（${contract.client.department}）`}
                      </TableCell>
                      <TableCell align="center">
                        {new Date(contract.start_date).toLocaleDateString()} ～{' '}
                        {new Date(contract.end_date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )
      ))}
    </Box>
  );
}; 