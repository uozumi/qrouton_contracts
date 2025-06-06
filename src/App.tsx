import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import { Layout } from './components/Layout';
import { ClientsPage } from './pages/ClientsPage';
import { ContractsPage } from './pages/ContractsPage';
import { DomainOptionsPage } from './pages/DomainOptionsPage';
import { PlansPage } from './pages/PlansPage';
import { ActiveContractsPage } from './pages/ActiveContractsPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ContractsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="contracts/active" element={<ActiveContractsPage />} />
            <Route path="domain-options" element={<DomainOptionsPage />} />
            <Route path="plans" element={<PlansPage />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
