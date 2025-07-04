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
  TableSortLabel,
  TextField,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { formatContractPeriod } from '../utils/dateFormat';
import { formatClientName } from '../utils/clientFormat';
import { formatPlanWithPrice } from '../utils/planFormat';
import { ContractModal } from '../components/modals/ContractModal';
import {
  Contract,
  ContractFormData,
  SimpleClient,
  Plan,
  SortOrder
} from '../types';
import { useContracts } from '../hooks/useContracts';
import { useClients } from '../hooks/useClients';
import { usePlans } from '../hooks/usePlans';

type SortField = 'client.name' | 'plan.name' | 'price' | 'start_date';

export const ActiveContractsPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [simpleClients, setSimpleClients] = useState<SimpleClient[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<SortField>('client.name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const { contracts, loading, fetchActiveContracts, updateContract } = useContracts();
  const { fetchSimpleClients } = useClients();
  const { plans, fetchPlans } = usePlans();

  useEffect(() => {
    fetchActiveContracts(selectedMonth);
  }, [selectedMonth]);

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

  // プランが読み込まれたときに初期選択状態を設定
  useEffect(() => {
    if (plans.length > 0) {
      const initialSelectedPlans = plans.reduce((acc, plan) => {
        acc[plan.name] = true; // 初期状態は全てのプランを選択
        return acc;
      }, {} as Record<string, boolean>);
      setSelectedPlans(initialSelectedPlans);
    }
  }, [plans]);

  const handleOpenDialog = (contract: Contract) => {
    setEditingContract(contract);
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
        await fetchActiveContracts(selectedMonth);
      }
      handleCloseDialog();
    } catch (error) {
      // エラーハンドリングは各hookで実施済み
    }
  };

  const handleMonthChange = (event: any) => {
    setSelectedMonth(event.target.value);
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = -6; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = `${date.getFullYear()}年${date.getMonth() + 1}月`;
      options.push({ value, label });
    }
    
    return options;
  };

  const calculateTotalAmount = (contracts: Contract[]) => {
    return contracts
      .filter(contract => selectedPlans[contract.plan?.name || ''])
      .reduce((sum, contract) => sum + (contract.price || 0), 0);
  };

  const calculatePlanCounts = (contracts: Contract[]) => {
    // 全てのプランを取得
    const allPlans = plans.map(plan => plan.name);
    
    // 契約があるプランの件数を計算
    const counts = contracts.reduce((acc, contract) => {
      const planName = contract.plan?.name || '不明';
      acc[planName] = (acc[planName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 全てのプランについて、契約件数を設定（契約がない場合は0）
    const result = allPlans.map(planName => ({
      planName,
      count: counts[planName] || 0
    }));

    // プラン名でソート（あいうえお順）
    return result.sort((a, b) => a.planName.localeCompare(b.planName, 'ja'));
  };

  const filteredContracts = contracts.filter(
    contract => selectedPlans[contract.plan?.name || '']
  );

  const handlePlanToggle = (planName: string) => {
    setSelectedPlans(prev => ({
      ...prev,
      [planName]: !prev[planName]
    }));
  };

  const handleSelectAllPlans = () => {
    const allSelected = plans.reduce((acc, plan) => {
      acc[plan.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedPlans(allSelected);
  };

  const handleDeselectAllPlans = () => {
    const allDeselected = plans.reduce((acc, plan) => {
      acc[plan.name] = false;
      return acc;
    }, {} as Record<string, boolean>);
    setSelectedPlans(allDeselected);
  };

  const getAllPlansSelected = () => {
    return plans.length > 0 && plans.every(plan => selectedPlans[plan.name]);
  };

  const getSomeButNotAllPlansSelected = () => {
    const selectedCount = plans.filter(plan => selectedPlans[plan.name]).length;
    return selectedCount > 0 && selectedCount < plans.length;
  };

  const handleMasterCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      handleSelectAllPlans();
    } else {
      handleDeselectAllPlans();
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

  // 契約終了月が選択月と同じかどうかを判定
  const isContractEndingInSelectedMonth = (endDate: string) => {
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
    const contractEndDate = new Date(endDate);
    const contractEndYear = contractEndDate.getFullYear();
    const contractEndMonth = contractEndDate.getMonth() + 1; // 0ベースなので+1
    
    return selectedYear === contractEndYear && selectedMonthNum === contractEndMonth;
  };

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'client.name':
        return multiplier * ((a.client?.name || '').localeCompare(b.client?.name || ''));
      case 'plan.name':
        return multiplier * ((a.plan?.name || '').localeCompare(b.plan?.name || ''));
      case 'price':
        return multiplier * ((a.price || 0) - (b.price || 0));
      case 'start_date':
        return multiplier * (new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
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
        <Typography variant="h5">有効契約一覧</Typography>
        <Stack direction="row" spacing={4} alignItems="center">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">契約中件数</Typography>
            <Typography variant="h6">{filteredContracts.length}件</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">合計金額（月額）</Typography>
            <Typography variant="h6">
              ¥{Math.round(calculateTotalAmount(contracts) / 12).toLocaleString()}
            </Typography>
          </Box>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>対象月</InputLabel>
            <Select
              value={selectedMonth}
              label="対象月"
              onChange={handleMonthChange}
            >
              {generateMonthOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>プラン別契約件数</Typography>
          <TableContainer component={Paper} sx={{ maxWidth: 600 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="60px" align="center">
                    <Checkbox
                      checked={getAllPlansSelected()}
                      indeterminate={getSomeButNotAllPlansSelected()}
                      onChange={handleMasterCheckboxChange}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>プラン名</TableCell>
                  <TableCell align="right">件数</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calculatePlanCounts(contracts).map(({ planName, count }) => {
                  const isSelected = selectedPlans[planName] || false;
                  const filteredCount = isSelected ? 
                    filteredContracts.filter(c => c.plan?.name === planName).length : 0;
                  
                  return (
                    <TableRow 
                      key={planName}
                      sx={{ 
                        opacity: isSelected ? 1 : 0.5,
                        backgroundColor: isSelected ? 'inherit' : 'action.hover'
                      }}
                    >
                      <TableCell align="center">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handlePlanToggle(planName)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{planName}</TableCell>
                      <TableCell align="right">
                        {isSelected ? `${filteredCount}件` : `0件 (${count}件)`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ minWidth: 800 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'client.name'}
                  direction={sortField === 'client.name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('client.name')}
                >
                  クライアント
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'plan.name'}
                  direction={sortField === 'plan.name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('plan.name')}
                >
                  プラン・料金
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'price'}
                  direction={sortField === 'price' ? sortOrder : 'asc'}
                  onClick={() => handleSort('price')}
                >
                  料金
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'start_date'}
                  direction={sortField === 'start_date' ? sortOrder : 'asc'}
                  onClick={() => handleSort('start_date')}
                >
                  契約期間
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedContracts.map((contract) => (
              <TableRow 
                key={contract.id}
                sx={{
                  ...(isContractEndingInSelectedMonth(contract.end_date) && {
                    backgroundColor: 'error.light',
                    '&:hover': {
                      backgroundColor: 'error.main',
                    }
                  }),
                  ...(!isContractEndingInSelectedMonth(contract.end_date) && {
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      '& .edit-button': {
                        opacity: 1,
                      }
                    }
                  }),
                  '& .edit-button': {
                    opacity: isContractEndingInSelectedMonth(contract.end_date) ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out',
                  }
                }}
              >
                <TableCell>
                  {contract.client && formatClientName(contract.client)}
                </TableCell>
                <TableCell>
                  {formatPlanWithPrice({ 
                    name: contract.plan?.name || '', 
                    price: contract.price 
                  })}
                </TableCell>
                <TableCell>
                  {contract.price ? `¥${Math.round(contract.price / 12).toLocaleString()}` : ''}
                </TableCell>
                <TableCell>
                  {formatContractPeriod(contract.start_date, contract.end_date)}
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