import { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { PlanModal } from '../components/modals/PlanModal';
import {
  Plan,
  PlanFormData
} from '../types';
import { usePlans } from '../hooks/usePlans';

export const PlansPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const { plans, loading, fetchPlans, updatePlan } = usePlans();

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

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
        await updatePlan(editingPlan.id, formData);
      }
      handleCloseDialog();
    } catch (error) {
      // エラーハンドリングは各hookで実施済み
    }
  };

  if (loading) {
    return <Typography>読み込み中...</Typography>;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        プラン一覧
      </Typography>

      <TableContainer component={Paper} sx={{ minWidth: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>プラン名</TableCell>
              <TableCell align="right">月額</TableCell>
              <TableCell align="right">年額</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow 
                key={plan.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    '& .edit-button': {
                      opacity: 1,
                    }
                  },
                  '& .edit-button': {
                    opacity: 0,
                    transition: 'opacity 0.2s ease-in-out',
                  }
                }}
              >
                <TableCell>{plan.name}</TableCell>
                <TableCell align="right">¥{plan.price_monthly?.toLocaleString()}</TableCell>
                <TableCell align="right">¥{plan.price_yearly?.toLocaleString()}</TableCell>
                <TableCell align="center">
                  <Tooltip title="編集">
                    <IconButton onClick={() => handleOpenDialog(plan)} size="small" className="edit-button">
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