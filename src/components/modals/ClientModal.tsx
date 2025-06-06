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
import {
  Client,
  ClientFormData,
  legalTypeOptions,
  legalPositionOptions,
  paymentMethodOptions
} from '../../types';

const initialFormData: ClientFormData = {
  name: '',
  legal_type: '株式会社',
  legal_position: '前株',
  department: '',
  default_contact_name: '',
  default_contact_email: '',
  payment_method: 'invoice',
};

interface ClientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (formData: ClientFormData) => Promise<void>;
  editingClient: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  open,
  onClose,
  onSubmit,
  editingClient,
}) => {
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);

  useEffect(() => {
    if (editingClient) {
      setFormData({
        name: editingClient.name || '',
        legal_type: editingClient.legal_type || '株式会社',
        legal_position: editingClient.legal_position || '前株',
        department: editingClient.department || '',
        default_contact_name: editingClient.default_contact_name || '',
        default_contact_email: editingClient.default_contact_email || '',
        payment_method: editingClient.payment_method || 'invoice'
      });
    } else {
      setFormData(initialFormData);
    }
  }, [editingClient, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
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
            {editingClient ? 'クライアント編集' : '新規クライアント'}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} variant="outlined" size="small">
              キャンセル
            </Button>
            <Button onClick={handleSubmit} variant="contained" size="small">
              {editingClient ? '更新' : '作成'}
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>

          <Stack direction="row" spacing={2}>
            <TextField
              name="legal_type"
              label="会社種別"
              value={formData.legal_type}
              onChange={handleInputChange}
              fullWidth
              select
              SelectProps={{
                native: true,
              }}
            >
              <option value="">選択してください</option>
              {legalTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
            <TextField
              name="legal_position"
              label="前株/後株"
              value={formData.legal_position}
              onChange={handleInputChange}
              fullWidth
              select
              SelectProps={{
                native: true,
              }}
              required
            >
              <option value="">選択してください</option>
              {legalPositionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </TextField>
          </Stack>
          <TextField
            name="name"
            label="会社名"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            name="department"
            label="部署"
            value={formData.department}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            name="default_contact_name"
            label="担当者名"
            value={formData.default_contact_name}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            name="default_contact_email"
            label="担当者メール"
            value={formData.default_contact_email}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            name="payment_method"
            label="支払方法"
            value={formData.payment_method}
            onChange={handleInputChange}
            fullWidth
            select
            SelectProps={{
              native: true,
            }}
          >
            {paymentMethodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}; 