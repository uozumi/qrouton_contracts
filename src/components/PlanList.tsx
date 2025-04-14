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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  TableSortLabel,
  Tooltip,
  Button,
  Link
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  duration_months: number;
}

interface PlanFormData {
  name: string;
  price_monthly: number;
  price_yearly: number;
  duration_months: number;
}

type SortField = 'name' | 'price_yearly';
type SortOrder = 'asc' | 'desc';

const initialFormData: PlanFormData = {
  name: '',
  price_monthly: 0,
  price_yearly: 0,
  duration_months: 12,
};

export const PlanList = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [sortField, setSortField] = useState<SortField>('price_yearly');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('プラン情報の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
    fetchPlans();
  };

  const handleOpenDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      duration_months: plan.duration_months
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlan(null);
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
      const { error } = await supabase
        .from('plans')
        .update(formData)
        .eq('id', editingPlan!.id);
      if (error) throw error;
      
      handleCloseDialog();
      fetchPlans();
    } catch (error) {
      console.error('プラン情報の保存に失敗しました:', error);
    }
  };

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">プラン一覧</Typography>
      </Stack>
      <Typography variant="body1" gutterBottom> 新たに追加したくば <Link href="https://supabase.com/dashboard/project/asclxkrkxkyquhuedtpu/editor/18024" target="_blank" rel="noopener noreferrer">supabase</Link>で直接</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>プラン名</TableCell>
              <TableCell align="right">料金（月額）</TableCell>
              <TableCell align="right">料金（年額）</TableCell>
              <TableCell align="right">契約単位（ヶ月）</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.name}</TableCell>
                <TableCell align="right">¥{plan.price_monthly?.toLocaleString() || '0'}</TableCell>
                <TableCell align="right">¥{plan.price_yearly?.toLocaleString() || '0'}</TableCell>
                <TableCell align="right">{plan.duration_months}</TableCell>
                <TableCell align="center">
                  <Tooltip title="編集">
                    <IconButton onClick={() => handleOpenDialog(plan)} size="small">
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
        <DialogTitle>プラン編集</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="プラン名"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="price_monthly"
              label="料金（月額）"
              type="number"
              value={formData.price_monthly}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="price_yearly"
              label="料金（年額）"
              type="number"
              value={formData.price_yearly}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="duration_months"
              label="契約単位（ヶ月）"
              type="number"
              value={formData.duration_months}
              onChange={handleInputChange}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained">更新</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 