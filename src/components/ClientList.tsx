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
  Collapse,
} from '@mui/material';
import { Edit as EditIcon, Add as AddIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface Client {
  id: string;
  name: string;
  legal_type: string;
  legal_position: string;
  department: string;
  default_contact_name: string;
  default_contact_email: string;
  payment_method: string;
}

interface ClientFormData {
  name: string;
  legal_type: string;
  legal_position: string;
  department: string;
  default_contact_name: string;
  default_contact_email: string;
  payment_method: string;
}

interface FilterData {
  name: string;
  department: string;
  contact_name: string;
}

const initialFormData: ClientFormData = {
  name: '',
  legal_type: '',
  legal_position: '',
  department: '',
  default_contact_name: '',
  default_contact_email: '',
  payment_method: '',
};

const initialFilterData: FilterData = {
  name: '',
  department: '',
  contact_name: '',
};

type SortField = 'name' | 'department' | 'default_contact_name' | 'payment_method';
type SortOrder = 'asc' | 'desc';

export const ClientList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filterData, setFilterData] = useState<FilterData>(initialFilterData);

  useEffect(() => {
    fetchClients();
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
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        legal_type: client.legal_type,
        legal_position: client.legal_position,
        department: client.department,
        default_contact_name: client.default_contact_name,
        default_contact_email: client.default_contact_email,
        payment_method: client.payment_method
      });
    } else {
      setEditingClient(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClient(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(formData)
          .eq('id', editingClient.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([formData]);
        if (error) throw error;
      }
      
      handleCloseDialog();
      fetchClients();
    } catch (error) {
      console.error('クライアント情報の保存に失敗しました:', error);
    }
  };

  const handleSort = (field: SortField) => {
    console.log('Sorting by:', field);
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

  const filteredClients = clients.filter(client => {
    return (
      (filterData.name === '' || client.name.toLowerCase().includes(filterData.name.toLowerCase())) &&
      (filterData.department === '' || client.department.toLowerCase().includes(filterData.department.toLowerCase())) &&
      (filterData.contact_name === '' || client.default_contact_name.toLowerCase().includes(filterData.contact_name.toLowerCase()))
    );
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    console.log('Current sort field:', sortField, 'Order:', sortOrder);
    
    switch (sortField) {
      case 'name':
        return multiplier * (a.name.localeCompare(b.name));
      case 'department':
        return multiplier * ((a.department || '').localeCompare(b.department || ''));
      case 'default_contact_name':
        return multiplier * ((a.default_contact_name || '').localeCompare(b.default_contact_name || ''));
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
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5">クライアント一覧</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            フィルター
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            新規クライアント
          </Button>
        </Stack>
      </Stack>

      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                name="name"
                label="会社名"
                value={filterData.name}
                onChange={handleFilterChange}
                fullWidth
                size="small"
              />
              <TextField
                name="department"
                label="部署"
                value={filterData.department}
                onChange={handleFilterChange}
                fullWidth
                size="small"
              />
              <TextField
                name="contact_name"
                label="担当者名"
                value={filterData.contact_name}
                onChange={handleFilterChange}
                fullWidth
                size="small"
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

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">登録件数</Typography>
            <Typography variant="h6">{filteredClients.length}件</Typography>
          </Box>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  会社名
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'department'}
                  direction={sortField === 'department' ? sortOrder : 'asc'}
                  onClick={() => handleSort('department')}
                >
                  部署
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'default_contact_name'}
                  direction={sortField === 'default_contact_name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('default_contact_name')}
                >
                  担当者
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
            {sortedClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.department}</TableCell>
                <TableCell>
                  <Typography variant="body2">{client.default_contact_name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {client.default_contact_email}
                  </Typography>
                </TableCell>
                <TableCell>{client.payment_method}</TableCell>
                <TableCell align="center">
                  <Tooltip title="編集">
                    <IconButton onClick={() => handleOpenDialog(client)} size="small">
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
          {editingClient ? 'クライアント編集' : '新規クライアント'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              name="name"
              label="会社名"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="legal_type"
              label="会社種別"
              value={formData.legal_type}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="legal_position"
              label="前株/後株"
              value={formData.legal_position}
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
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClient ? '更新' : '作成'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 