import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { PlanModal } from '../components/modals/PlanModal';

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

export const PlansPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (formData: PlanFormData) => {
    try {
      if (editingPlan) {
        const { error } = await supabase
          .from('plans')
          .update(formData)
          .eq('id', editingPlan.id);
        if (error) throw error;
      }

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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>プラン名</TableCell>
              <TableCell align="right">月額</TableCell>
              <TableCell align="right">年額</TableCell>
              <TableCell align="center">契約期間</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.name}</TableCell>
                <TableCell align="right">¥{plan.price_monthly.toLocaleString()}</TableCell>
                <TableCell align="right">¥{plan.price_yearly.toLocaleString()}</TableCell>
                <TableCell align="center">{plan.duration_months}ヶ月</TableCell>
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

      <PlanModal
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        editingPlan={editingPlan}
      />
    </Box>
  );
}; 