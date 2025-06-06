import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Stack,
  Typography,
} from '@mui/material';

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

const initialFormData: PlanFormData = {
  name: '',
  price_monthly: 0,
  price_yearly: 0,
  duration_months: 12,
};

interface PlanModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: PlanFormData) => Promise<void>;
  editingPlan: Plan | null;
}

export const PlanModal: React.FC<PlanModalProps> = ({
  open,
  onClose,
  onSubmit,
  editingPlan,
}) => {
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);

  useEffect(() => {
    if (editingPlan) {
      setFormData({
        name: editingPlan.name,
        price_monthly: editingPlan.price_monthly,
        price_yearly: editingPlan.price_yearly,
        duration_months: editingPlan.duration_months
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingPlan, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            プラン編集
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} variant="outlined" size="small">
              キャンセル
            </Button>
            <Button onClick={handleSubmit} variant="contained" size="small">
              更新
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>
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
    </Dialog>
  );
}; 