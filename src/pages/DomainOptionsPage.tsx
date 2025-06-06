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
  TableSortLabel,
  Typography,
  Stack,
  Chip
} from '@mui/material';
import { supabase } from '../lib/supabase';
import { formatContractPeriod } from '../utils/dateFormat';

type SortField = 'client.name' | 'start_date';
type SortOrder = 'asc' | 'desc';

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
  const [sortStates, setSortStates] = useState<Record<string, { field: SortField; order: SortOrder }>>({});

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
      // 有効な契約のみを月別にグループ化
      if (contract.status === 'active') {
        const month = getMonthFromDate(contract.start_date);
        grouped[month].push(contract);
      }
    });

    return grouped;
  };

  // 月別詳細テーブル用：全ての契約を含む
  const groupAllContractsByMonth = () => {
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

  // 各月のソート状態を取得または初期化
  const getSortState = (month: string) => {
    return sortStates[month] || { field: 'client.name', order: 'asc' };
  };

  // ソートハンドラー
  const handleSort = (month: string, field: SortField) => {
    setSortStates(prev => {
      const currentState = prev[month] || { field: 'client.name', order: 'asc' };
      const newOrder = currentState.field === field && currentState.order === 'asc' ? 'desc' : 'asc';
      
      return {
        ...prev,
        [month]: { field, order: newOrder }
      };
    });
  };

  // 契約をソート
  const sortContracts = (contracts: Contract[], month: string) => {
    const { field, order } = getSortState(month);
    const multiplier = order === 'asc' ? 1 : -1;

    return [...contracts].sort((a, b) => {
      switch (field) {
        case 'client.name':
          return multiplier * (a.client.name || '').localeCompare(b.client.name || '', 'ja');
        case 'start_date':
          return multiplier * (new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  const groupedContracts = groupContractsByMonth(); // 有効契約のみ（件数表示用）
  const allGroupedContracts = groupAllContractsByMonth(); // 全契約（詳細表示用）
  const currentMonth = `${new Date().getMonth() + 1}月`;

  return (
    <Box>
      {/* 固定ヘッダー部分 */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.default',
          zIndex: 100,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3, pt: 2 }}>
          <Typography variant="h5">独自ドメインオプション利用者一覧</Typography>
        </Stack>

        <TableContainer component={Paper} sx={{ minWidth: 800 }}>
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
      </Box>

      {/* スクロール可能なコンテンツ部分 */}
      <Box sx={{ mt: 3 }}>
        {Object.entries(allGroupedContracts).map(([month, monthContracts]) => (
          monthContracts.length > 0 && (
            <Box key={month} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {month}（{monthContracts.length}件）
              </Typography>
              <TableContainer component={Paper} sx={{ minWidth: 800 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="50%">
                        <TableSortLabel
                          active={getSortState(month).field === 'client.name'}
                          direction={getSortState(month).field === 'client.name' ? getSortState(month).order : 'asc'}
                          onClick={() => handleSort(month, 'client.name')}
                        >
                          クライアント
                        </TableSortLabel>
                      </TableCell>
                      <TableCell width="30%" align="center">
                        <TableSortLabel
                          active={getSortState(month).field === 'start_date'}
                          direction={getSortState(month).field === 'start_date' ? getSortState(month).order : 'asc'}
                          onClick={() => handleSort(month, 'start_date')}
                        >
                          契約期間
                        </TableSortLabel>
                      </TableCell>
                      <TableCell width="20%" align="center">ステータス</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortContracts(monthContracts, month).map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          {contract.client.name}
                          {contract.client.department && `（${contract.client.department}）`}
                        </TableCell>
                        <TableCell align="center">
                          {formatContractPeriod(contract.start_date, contract.end_date)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              contract.status === 'active' ? '有効' :
                              contract.status === 'paused' ? '一時停止' :
                              contract.status === 'cancelled' ? '解約' : '無効'
                            }
                            color={
                              contract.status === 'active' ? 'success' :
                              contract.status === 'paused' ? 'warning' : 'error'
                            }
                            size="small"
                          />
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
    </Box>
  );
}; 