import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Layout } from './components/Layout';
import { ClientList } from './components/ClientList';
import { ContractList } from './components/ContractList';
import { DomainOptionList } from './components/DomainOptionList';
import { PlanList } from './components/PlanList';
import { ContractActiveList } from './components/ContractActiveList';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ContractList />} />
            <Route path="clients" element={<ClientList />} />
            <Route path="contracts" element={<ContractList />} />
            <Route path="contracts/active" element={<ContractActiveList />} />
            <Route path="domain-options" element={<DomainOptionList />} />
            <Route path="plans" element={<PlanList />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
