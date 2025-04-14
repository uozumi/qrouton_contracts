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
  MenuItem,
  Chip,
  FormControlLabel,
  Switch,
  Collapse,
  Tooltip,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Edit as EditIcon, Add as AddIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { formatDate } from '../utils/dateFormat';

interface Contract {
  id: string;
  client: {
    id: string;
    name: string;
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
}

interface Client {
  id: string;
  name: string;
}

interface Plan {
  id: string;
  name: string;
}

type SortField = 'client.name' | 'plan.name' | 'price' | 'start_date' | 'status';
type SortOrder = 'asc' | 'desc';

interface FilterData {
  clientId: string;
  planId: string;
  status: string;
  startDateFrom: string;
  startDateTo: string;
}

const initialFormData: ContractFormData = {
  client_id: '',
  plan_id: '',
  price: 0,
  start_date: '',
  end_date: '',
  auto_renew: false,
  status: 'pending',
  contact_name: '',
  contact_email: '',
};

const statusOptions = [
  { value: 'active', label: '有効' },
  { value: 'pending', label: '準備中' },
  { value: 'expired', label: '期限切れ' },
];

const initialFilterData: FilterData = {
  clientId: '',
  planId: '',
  status: '',
  startDateFrom: '',
  startDateTo: '',
};

export const ContractList = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<ContractFormData>(initialFormData);
  const [sortField, setSortField] = useState<SortField>('start_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterData, setFilterData] = useState<FilterData>(initialFilterData);

  useEffect(() => {
    fetchClients();
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchContracts();
  }, []);

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
            name
          ),
          plan:plans (
            name
          )
        `)
        .order('start_date');

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error('契約情報の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (contract?: Contract) => {
    if (contract) {
      setEditingContract(contract);
      setFormData({
        client_id: contract.client.id || '',
        plan_id: contract.plan.id || '',
        price: contract.price || 0,
        start_date: contract.start_date || '',
        end_date: contract.end_date || '',
        auto_renew: contract.auto_renew || false,
        status: contract.status || 'pending',
        contact_name: contract.contact_name || '',
        contact_email: contract.contact_email || '',
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      } else {
        const { error } = await supabase
          .from('contracts')
          .insert([formData]);
        if (error) throw error;
      }
      
      handleCloseDialog();
      fetchContracts();
    } catch (error) {
      console.error('契約情報の保存に失敗しました:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  const isFieldEditable = (fieldName: string): boolean => {
    if (!editingContract) return true;
    
    const nonEditableFields = ['client_id', 'plan_id', 'start_date', 'end_date'];
    return !nonEditableFields.includes(fieldName);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterData(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilterData(initialFilterData);
  };

  const sortedContracts = [...contracts].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'client.name':
        return multiplier * ((a.client?.name || '').localeCompare(b.client?.name || ''));
      case 'plan.name':
        return multiplier * ((a.plan?.name || '').localeCompare(b.plan?.name || ''));
      case 'price':
        return multiplier * ((a.price || 0) - (b.price || 0));
      case 'start_date':
        return multiplier * (new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
      case 'status':
        return multiplier * (a.status.localeCompare(b.status));
      default:
        return 0;
    }
  });

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">契約一覧</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          新規契約
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">表示件数</Typography>
            <Typography variant="h6">{contracts.length}件</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">合計金額（月額）</Typography>
            <Typography variant="h6">
              ¥{Math.round(contracts
                .filter(contract => contract.plan?.name !== '独自ドメインオプション利用料')
                .reduce((sum, contract) => sum + (contract.price || 0), 0) / 12)
                .toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                name="clientId"
                label="クライアント"
                value={filterData.clientId}
                onChange={handleFilterChange}
                fullWidth
              >
                <MenuItem value="">全て</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                name="planId"
                label="プラン"
                value={filterData.planId}
                onChange={handleFilterChange}
                fullWidth
              >
                <MenuItem value="">全て</MenuItem>
                {plans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                name="status"
                label="ステータス"
                value={filterData.status}
                onChange={handleFilterChange}
                fullWidth
              >
                <MenuItem value="">全て</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                name="startDateFrom"
                label="開始日（から）"
                type="date"
                value={filterData.startDateFrom}
                onChange={handleFilterChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                name="startDateTo"
                label="開始日（まで）"
                type="date"
                value={filterData.startDateTo}
                onChange={handleFilterChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <Box>
              <Button onClick={resetFilters}>
                フィルターをリセット
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Collapse>

      <TableContainer component={Paper}>
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
                  active={sortField === 'plan.name'}
                  direction={sortField === 'plan.name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('plan.name')}
                >
                  プラン
                </TableSortLabel>
              </TableCell>
              <TableCell>
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
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  ステータス
                </TableSortLabel>
              </TableCell>
              <TableCell>支払方法</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedContracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell>{contract.client?.name}</TableCell>
                <TableCell>{contract.plan?.name}</TableCell>
                <TableCell align="right">¥{Math.round((contract.price || 0) / 12).toLocaleString()}</TableCell>
                <TableCell>
                  {formatDate(contract.start_date)} 〜 {formatDate(contract.end_date)}
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: contract.status === 'active' ? 'success.main' : 'error.main',
                      fontWeight: 'bold'
                    }}
                  >
                    {contract.status === 'active' ? '有効' : '無効'}
                  </Typography>
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
          {editingContract ? '契約情報の編集' : '新規契約登録'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              name="client_id"
              label="クライアント"
              value={formData.client_id}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={!isFieldEditable('client_id')}
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              name="plan_id"
              label="プラン"
              value={formData.plan_id}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={!isFieldEditable('plan_id')}
            >
              {plans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="price"
              label="金額"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="start_date"
              label="契約開始日"
              type="date"
              value={formData.start_date}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              name="end_date"
              label="契約終了日"
              type="date"
              value={formData.end_date}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  name="auto_renew"
                  checked={formData.auto_renew}
                  onChange={handleInputChange}
                />
              }
              label="自動更新"
            />
            <TextField
              select
              name="status"
              label="ステータス"
              value={formData.status}
              onChange={handleInputChange}
              fullWidth
              required
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="contact_name"
              label="担当者名"
              value={formData.contact_name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="contact_email"
              label="担当者メールアドレス"
              type="email"
              value={formData.contact_email}
              onChange={handleInputChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingContract ? '更新' : '登録'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 