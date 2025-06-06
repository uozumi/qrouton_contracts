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
import { formatDate } from '../utils/dateFormat';
import { formatClientName } from '../utils/clientFormat';
import { ClientModal } from '../components/modals/ClientModal';
import {
  Client,
  ClientFormData,
  ClientSortField as SortField
} from '../types';
import { useClients } from '../hooks/useClients';
import { useTableSort } from '../hooks/useTableSort';

export const ClientsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filterKeyword, setFilterKeyword] = useState('');

  const { clients, loading, fetchClients, createClient, updateClient } = useClients();

  // フィルタリング
  const filteredData = clients.filter(client => {
    if (!filterKeyword) return true;
    
    const keyword = filterKeyword.toLowerCase();
    return (
      client.name.toLowerCase().includes(keyword) ||
      (client.department && client.department.toLowerCase().includes(keyword)) ||
      (client.default_contact_name && client.default_contact_name.toLowerCase().includes(keyword)) ||
      (client.default_contact_email && client.default_contact_email.toLowerCase().includes(keyword))
    );
  });

  // ソート
  const { sortField, sortOrder, sortedData, handleSort } = useTableSort(
    filteredData,
    'first_contract_date' as SortField,
    'desc'
  );

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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
        await updateClient(editingClient.id, formData);
      } else {
        await createClient(formData);
      }
      handleCloseDialog();
    } catch (error) {
      // エラーハンドリングは各hookで実施済み
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterKeyword(e.target.value);
  };

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
            <Typography variant="h6">{sortedData.length}件</Typography>
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

      <TableContainer component={Paper} sx={{ minWidth: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name' as SortField)}
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
                  onClick={() => handleSort('first_contract_date' as SortField)}
                >
                  初回契約日
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((client) => (
              <TableRow 
                key={client.id}
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
                    <IconButton onClick={() => handleOpenDialog(client)} size="small" className="edit-button">
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