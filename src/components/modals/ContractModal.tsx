import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  Typography,
} from '@mui/material';
import { supabase } from '../../lib/supabase';
import { formatClientName } from '../../utils/clientFormat';

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
  department: string;
}

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  duration_months: number;
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

const statusOptions = [
  { value: 'active', label: '有効' },
  { value: 'pending', label: '準備中' },
  { value: 'expired', label: '期限切れ' },
];

const paymentMethodOptions = [
  { value: 'invoice', label: '請求書払い' },
  { value: 'stripe', label: 'Stripe' },
];

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

interface ContractModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: ContractFormData) => Promise<void>;
  editingContract: Contract | null;
  clients: Client[];
  plans: Plan[];
  isFieldEditable?: (fieldName: string) => boolean;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  open,
  onClose,
  onSubmit,
  editingContract,
  clients,
  plans,
  isFieldEditable = () => true,
}) => {
  const [formData, setFormData] = useState<ContractFormData>(initialFormData);

  useEffect(() => {
    if (editingContract) {
      setFormData({
        client_id: editingContract.client?.id || '',
        plan_id: editingContract.plan?.id || '',
        price: editingContract.price || 0,
        start_date: editingContract.start_date || '',
        end_date: editingContract.end_date || '',
        auto_renew: editingContract.auto_renew || false,
        status: editingContract.status || 'pending',
        contact_name: editingContract.contact_name || '',
        contact_email: editingContract.contact_email || '',
        payment_method: editingContract.payment_method || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingContract, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'plan_id') {
      // プラン選択時に金額を自動補完
      const selectedPlan = plans.find(plan => plan.id === value);
      if (selectedPlan) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          price: selectedPlan.price_yearly || 0
        }));
        return;
      }
    }
    
    if (name === 'start_date') {
      // 契約開始日選択時に終了日を自動計算（1年後の前日）
      if (value) {
        const startDate = new Date(value);
        // 1年後の同じ日
        const nextYear = new Date(startDate);
        nextYear.setFullYear(startDate.getFullYear() + 1);
        // 1日前にする
        nextYear.setDate(nextYear.getDate() - 1);
        const endDateString = nextYear.toISOString().split('T')[0];
        
        setFormData(prev => ({
          ...prev,
          [name]: value,
          end_date: endDateString
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
            {editingContract ? '契約情報の編集' : '新規契約登録'}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} variant="outlined" size="small">
              キャンセル
            </Button>
            <Button onClick={handleSubmit} variant="contained" size="small">
              {editingContract ? '更新' : '登録'}
            </Button>
          </Stack>
        </Stack>
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
                {formatClientName(client)}
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
          <Stack direction="row" spacing={2}>
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
          </Stack>
          <Stack direction="row" spacing={2}>
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
              disabled={!isFieldEditable('start_date')}
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
              disabled={!isFieldEditable('end_date')}
            />
          </Stack>
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
            select
            name="payment_method"
            label="支払い方法"
            value={formData.payment_method}
            onChange={handleInputChange}
            fullWidth
            required
          >
            {paymentMethodOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 