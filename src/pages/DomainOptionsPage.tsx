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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { formatContractPeriod } from '../utils/dateFormat';
import { useContracts } from '../hooks/useContracts';

type SortField = 'client.name' | 'start_date';
type SortOrder = 'asc' | 'desc';

export const DomainOptionsPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  );
  const [sortField, setSortField] = useState<SortField>('client.name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const { contracts, loading, fetchActiveContracts } = useContracts();

  useEffect(() => {
    fetchActiveContracts(selectedMonth);
  }, [selectedMonth]);

  const handleMonthChange = (event: any) => {
    setSelectedMonth(event.target.value);
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = -6; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      options.push({ value, label });
    }
    
    return options;
  };

  // 独自ドメインオプション契約のみをフィルタリング
  const domainOptionContracts = contracts.filter(
    contract => contract.plan?.name === '独自ドメインオプション利用料'
  );

  // ソートハンドラー
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 契約をソート
  const sortedContracts = [...domainOptionContracts].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;

    switch (sortField) {
      case 'client.name':
        return multiplier * (a.client?.name || '').localeCompare(b.client?.name || '', 'ja');
      case 'start_date':
        return multiplier * (new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
      default:
        return 0;
    }
  });

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

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
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>対象月</InputLabel>
            <Select
              value={selectedMonth}
              label="対象月"
              onChange={handleMonthChange}
            >
              {generateMonthOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* 選択月の契約数表示 */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">
            {generateMonthOptions().find(opt => opt.value === selectedMonth)?.label}時点で有効な独自ドメインオプション契約: {domainOptionContracts.length}件
          </Typography>
        </Paper>
      </Box>

      {/* スクロール可能なコンテンツ部分 */}
      <Box sx={{ mt: 3 }}>
        {domainOptionContracts.length > 0 ? (
          <TableContainer component={Paper} sx={{ minWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="50%">
                    <TableSortLabel
                      active={sortField === 'client.name'}
                      direction={sortField === 'client.name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('client.name')}
                    >
                      クライアント
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="30%" align="center">
                    <TableSortLabel
                      active={sortField === 'start_date'}
                      direction={sortField === 'start_date' ? sortOrder : 'asc'}
                      onClick={() => handleSort('start_date')}
                    >
                      契約期間
                    </TableSortLabel>
                  </TableCell>
                  <TableCell width="20%" align="center">ステータス</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedContracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      {contract.client?.name}
                      {contract.client?.department && `（${contract.client?.department}）`}
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
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              選択された月に有効な独自ドメインオプション契約はありません
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}; 