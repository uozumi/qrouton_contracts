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
  TextField,
  MenuItem,
  Tooltip,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import { formatContractPeriod } from '../utils/dateFormat';
import { formatClientName } from '../utils/clientFormat';
import { ContractModal } from '../components/modals/ContractModal';
import {
  Contract,
  ContractFormData,
  SimpleClient,
  Plan,
  statusOptions
} from '../types';
import { useContracts } from '../hooks/useContracts';
import { useClients } from '../hooks/useClients';
import { usePlans } from '../hooks/usePlans';

export const ContractsPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [filterKeyword, setFilterKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [simpleClients, setSimpleClients] = useState<SimpleClient[]>([]);

  const { contracts, loading, fetchContracts, createContract, updateContract } = useContracts();
  const { fetchSimpleClients } = useClients();
  const { plans, fetchPlans } = usePlans();

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    const loadSimpleClients = async () => {
      const data = await fetchSimpleClients();
      setSimpleClients(data);
    };
    loadSimpleClients();
  }, [fetchSimpleClients]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpenDialog = (contract?: Contract) => {
    setEditingContract(contract || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingContract(null);
  };

  const handleSubmit = async (formData: ContractFormData) => {
    try {
      if (editingContract) {
        await updateContract(editingContract.id, formData);
      } else {
        await createContract(formData);
      }
      handleCloseDialog();
    } catch (error) {
      // エラーハンドリングは各hookで実施済み
    }
  };

  const filteredContracts = contracts.filter(contract => {
    if (statusFilter && contract.status !== statusFilter) return false;
    
    if (filterKeyword) {
      const keyword = filterKeyword.toLowerCase();
      return (
        (contract.client?.name && contract.client.name.toLowerCase().includes(keyword)) ||
        (contract.client?.department && contract.client.department.toLowerCase().includes(keyword)) ||
        (contract.plan?.name && contract.plan.name.toLowerCase().includes(keyword))
      );
    }
    
    return true;
  });

  const statistics = {
    total: filteredContracts.length,
    active: filteredContracts.filter(c => c.status === 'active').length,
    paused: filteredContracts.filter(c => c.status === 'paused').length,
    cancelled: filteredContracts.filter(c => c.status === 'cancelled').length
  };

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
        <Stack direction="row" spacing={4} alignItems="center">
          <TextField
            label="キーワード検索"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
            placeholder="クライアント名、プラン名で検索"
            size="small"
            sx={{ minWidth: 300 }}
          />
          <TextField
            select
            label="ステータス"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">全て</MenuItem>
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={3}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">合計</Typography>
              <Typography variant="h6">{statistics.total}件</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">有効</Typography>
              <Typography variant="h6" color="success.main">{statistics.active}件</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">一時停止</Typography>
              <Typography variant="h6" color="warning.main">{statistics.paused}件</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">解約</Typography>
              <Typography variant="h6" color="error.main">{statistics.cancelled}件</Typography>
            </Box>
          </Stack>
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ minWidth: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>クライアント</TableCell>
              <TableCell>プラン・料金</TableCell>
              <TableCell>契約期間</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContracts.map((contract) => (
              <TableRow 
                key={contract.id}
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
                  {contract.client && formatClientName(contract.client)}
                </TableCell>
                <TableCell>
                  {contract.plan?.name}（{contract.price?.toLocaleString()}円/年）
                </TableCell>
                <TableCell>
                  {formatContractPeriod(contract.start_date, contract.end_date)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      contract.status === 'active' ? '有効' :
                      contract.status === 'paused' ? '一時停止' : '解約'
                    }
                    color={
                      contract.status === 'active' ? 'success' :
                      contract.status === 'paused' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="編集">
                    <IconButton onClick={() => handleOpenDialog(contract)} size="small" className="edit-button">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ContractModal
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        editingContract={editingContract}
        clients={simpleClients}
        plans={plans}
      />
    </Box>
  );
}; 