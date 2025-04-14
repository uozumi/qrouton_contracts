import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
  Stack,
  Tooltip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

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
  price: number;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  status: string;
  contact_name: string;
  contact_email: string;
  payment_method: string;
}

interface Client {
  id: string;
  name: string;
}

interface Plan {
  id: string;
  name: string;
}

interface ContractFormData {
  client_id: string;
  plan_id: string;
  price: number;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  status: string;
  contact_name: string;
  contact_email: string;
  payment_method: string;
}

const initialFormData: ContractFormData = {
  client_id: '',
  plan_id: '',
  price: 0,
  start_date: '',
  end_date: '',
  auto_renew: true,
  status: 'active',
  contact_name: '',
  contact_email: '',
  payment_method: '',
};

type SortField = 'client.name' | 'client.department' | 'plan.name' | 'price' | 'start_date' | 'payment_method';
type SortOrder = 'asc' | 'desc';

export const ContractActiveList = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<ContractFormData>(initialFormData);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [includeDomainOption, setIncludeDomainOption] = useState(false);
  const [sortField, setSortField] = useState<SortField>('client.name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchClients();
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [selectedMonth]);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('クライアント情報の取得に失敗しました:', error);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('name');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('プラン情報の取得に失敗しました:', error);
    }
  };

  const fetchContracts = async () => {
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
        .order('start_date');

      if (error) throw error;

      // 選択された月の時点で有効な契約のみをフィルタリング
      const filteredContracts = (data || []).filter(contract => {
        const selectedDate = new Date(selectedMonth);
        const startDate = new Date(contract.start_date);
        const endDate = new Date(contract.end_date);

        // 選択された月の最初の日と最後の日を取得
        const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

        // 選択された月の期間内に契約が有効だったかどうかを判定
        return startDate <= lastDayOfMonth && endDate >= firstDayOfMonth;
      });

      setContracts(filteredContracts);
    } catch (error) {
      console.error('契約情報の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMonth(event.target.value);
  };

  const handleOpenDialog = (contract?: Contract) => {
    if (contract) {
      setEditingContract(contract);
      setFormData({
        client_id: contract.client.id,
        plan_id: contract.plan.id,
        price: contract.price,
        start_date: contract.start_date,
        end_date: contract.end_date,
        auto_renew: contract.auto_renew,
        status: contract.status,
        contact_name: contract.contact_name,
        contact_email: contract.contact_email,
        payment_method: contract.payment_method
      });
    } else {
      setEditingContract(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingContract(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingContract) {
        const { error } = await supabase
          .from('contracts')
          .update(formData)
          .eq('id', editingContract.id);
        if (error) throw error;
      }
      
      handleCloseDialog();
      fetchContracts();
    } catch (error) {
      console.error('契約情報の保存に失敗しました:', error);
    }
  };

  const calculateTotalAmount = (contracts: Contract[]) => {
    return contracts
      .filter(contract => includeDomainOption || contract.plan?.name !== '独自ドメインオプション利用料')
      .reduce((sum, contract) => sum + (contract.price || 0), 0);
  };

  const calculatePlanCounts = (contracts: Contract[]) => {
    // 全てのプランを取得
    const allPlans = plans.map(plan => plan.name);
    
    // 契約があるプランの件数を計算
    const counts = contracts.reduce((acc, contract) => {
      const planName = contract.plan?.name || '不明';
      acc[planName] = (acc[planName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 全てのプランについて、契約件数を設定（契約がない場合は0）
    const result = allPlans.map(planName => ({
      planName,
      count: counts[planName] || 0
    }));

    // 独自ドメインオプションを除外する場合はフィルタリング
    const filteredResult = includeDomainOption 
      ? result 
      : result.filter(item => item.planName !== '独自ドメインオプション利用料');

    // プラン名でソート（あいうえお順）
    return filteredResult.sort((a, b) => a.planName.localeCompare(b.planName, 'ja'));
  };

  const filteredContracts = contracts.filter(
    contract => includeDomainOption || contract.plan?.name !== '独自ドメインオプション利用料'
  );

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'client.name':
        return multiplier * ((a.client?.name || '').localeCompare(b.client?.name || ''));
      case 'client.department':
        return multiplier * ((a.client?.department || '').localeCompare(b.client?.department || ''));
      case 'plan.name':
        return multiplier * ((a.plan?.name || '').localeCompare(b.plan?.name || ''));
      case 'price':
        return multiplier * ((a.price || 0) - (b.price || 0));
      case 'start_date':
        return multiplier * (new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
      case 'payment_method':
        return multiplier * ((a.payment_method || '').localeCompare(b.payment_method || ''));
      default:
        return 0;
    }
  });

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ p: 3, width: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">契約中一覧</Typography>
        </Stack>
        <Paper sx={{ p: 2, mb: 2, width: '100%' }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={4} alignItems="center">
              <Box>
                <TextField
                  type="month"
                  label="表示月"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">契約中件数</Typography>
                <Typography variant="h6">{filteredContracts.length}件</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">合計金額（月額）</Typography>
                <Typography variant="h6">
                  ¥{Math.round(calculateTotalAmount(contracts) / 12).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeDomainOption}
                      onChange={(e) => setIncludeDomainOption(e.target.checked)}
                    />
                  }
                  label="独自ドメインオプション"
                />
              </Box>
            </Stack>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>プラン別契約件数</Typography>
              <TableContainer component={Paper} sx={{ maxWidth: 500 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>プラン名</TableCell>
                      <TableCell align="right">件数</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calculatePlanCounts(filteredContracts).map(({ planName, count }) => (
                      <TableRow key={planName}>
                        <TableCell>{planName}</TableCell>
                        <TableCell align="right">{count}件</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Stack>
        </Paper>

        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'client.name'}
                    direction={sortField === 'client.name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('client.name')}
                  >
                    クライアント
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'client.department'}
                    direction={sortField === 'client.department' ? sortOrder : 'asc'}
                    onClick={() => handleSort('client.department')}
                  >
                    部署
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'plan.name'}
                    direction={sortField === 'plan.name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('plan.name')}
                  >
                    プラン
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'price'}
                    direction={sortField === 'price' ? sortOrder : 'asc'}
                    onClick={() => handleSort('price')}
                  >
                    料金（月額）
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'start_date'}
                    direction={sortField === 'start_date' ? sortOrder : 'asc'}
                    onClick={() => handleSort('start_date')}
                  >
                    契約期間
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'payment_method'}
                    direction={sortField === 'payment_method' ? sortOrder : 'asc'}
                    onClick={() => handleSort('payment_method')}
                  >
                    支払方法
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.client?.name}</TableCell>
                  <TableCell>{contract.client?.department}</TableCell>
                  <TableCell>{contract.plan?.name}</TableCell>
                  <TableCell align="right">¥{Math.round((contract.price || 0) / 12).toLocaleString()}</TableCell>
                  <TableCell>
                    {format(new Date(contract.start_date), 'yyyy年M月d日', { locale: ja })} 〜{' '}
                    {format(new Date(contract.end_date), 'yyyy年M月d日', { locale: ja })}
                  </TableCell>
                  <TableCell>{contract.payment_method}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="編集">
                      <IconButton onClick={() => handleOpenDialog(contract)} size="small">
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingContract ? '契約編集' : '新規契約'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                name="client_id"
                label="クライアント"
                value={formData.client_id}
                onChange={handleInputChange}
                fullWidth
                select
                SelectProps={{
                  native: true
                }}
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </TextField>
              <TextField
                name="plan_id"
                label="プラン"
                value={formData.plan_id}
                onChange={handleInputChange}
                fullWidth
                select
                SelectProps={{
                  native: true
                }}
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </TextField>
              <TextField
                name="price"
                label="料金（年額）"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                name="start_date"
                label="開始日"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                name="end_date"
                label="終了日"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                name="contact_name"
                label="担当者名"
                value={formData.contact_name}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                name="contact_email"
                label="担当者メール"
                value={formData.contact_email}
                onChange={handleInputChange}
                fullWidth
              />
              <TextField
                name="payment_method"
                label="支払方法"
                value={formData.payment_method}
                onChange={handleInputChange}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>キャンセル</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editingContract ? '更新' : '作成'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}; 