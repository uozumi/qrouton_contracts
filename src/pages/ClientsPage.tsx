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
  TableSortLabel,
  TextField,
  Typography,
  Stack,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { formatDate } from '../utils/dateFormat';
import { formatClientName } from '../utils/clientFormat';
import { ClientModal } from '../components/modals/ClientModal';

interface Client {
  id: string;
  name: string;
  legal_type: string;
  legal_position: string;
  department: string;
  default_contact_name: string;
  default_contact_email: string;
  payment_method: string;
  first_contract_date: string | null;
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

type SortField = 'name' | 'first_contract_date';
type SortOrder = 'asc' | 'desc';

export const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [sortField, setSortField] = useState<SortField>('first_contract_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterKeyword, setFilterKeyword] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          contracts!inner(start_date)
        `)
        .order('name');

      if (error) throw error;

      const processedClients = data?.map((client: any) => ({
        ...client,
        first_contract_date: client.contracts?.length > 0 
          ? client.contracts.reduce((earliest: string, contract: any) => 
              new Date(contract.start_date) < new Date(earliest) ? contract.start_date : earliest
            , client.contracts[0].start_date)
          : null
      })) || [];

      setClients(processedClients);
    } catch (error) {
      console.error('クライアント情報の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (client?: Client) => {
    setEditingClient(client || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClient(null);
  };

  const handleSubmit = async (formData: ClientFormData) => {
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
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterKeyword(e.target.value);
  };

  const filteredClients = clients.filter(client => {
    if (!filterKeyword) return true;
    
    const keyword = filterKeyword.toLowerCase();
    return (
      client.name.toLowerCase().includes(keyword) ||
      (client.department && client.department.toLowerCase().includes(keyword)) ||
      (client.default_contact_name && client.default_contact_name.toLowerCase().includes(keyword)) ||
      (client.default_contact_email && client.default_contact_email.toLowerCase().includes(keyword))
    );
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);
      case 'first_contract_date':
        const dateA = a.first_contract_date ? new Date(a.first_contract_date).getTime() : 0;
        const dateB = b.first_contract_date ? new Date(b.first_contract_date).getTime() : 0;
        return multiplier * (dateA - dateB);
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          新規クライアント
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={4} alignItems="center">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">表示件数</Typography>
            <Typography variant="h6">{sortedClients.length}件</Typography>
          </Box>
          <TextField
            label="キーワード検索"
            value={filterKeyword}
            onChange={handleFilterChange}
            placeholder="会社名、部署、担当者、メールで検索"
            size="small"
            sx={{ minWidth: 300 }}
          />
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
                  クライアント
                </TableSortLabel>
              </TableCell>
              <TableCell>担当者</TableCell>
              <TableCell>支払方法</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'first_contract_date'}
                  direction={sortField === 'first_contract_date' ? sortOrder : 'asc'}
                  onClick={() => handleSort('first_contract_date')}
                >
                  初回契約日
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  {formatClientName(client)}
                </TableCell>
                <TableCell>
                  {client.default_contact_name}{client.default_contact_email ? `（${client.default_contact_email}）` : ''}
                </TableCell>
                <TableCell>{client.payment_method === 'invoice' ? '請求書払い' : 'Stripe'}</TableCell>
                <TableCell>
                  {client.first_contract_date ? formatDate(client.first_contract_date) : '-'}
                </TableCell>
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

      <ClientModal
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        editingClient={editingClient}
      />
    </Box>
  );
};