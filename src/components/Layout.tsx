import { Box, CssBaseline, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, ListSubheader } from '@mui/material';
import { Dashboard, People, Settings, Business, Domain, CardMembership } from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            QRouton契約管理
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListSubheader>VIEW</ListSubheader>
            <ListItem 
              onClick={() => navigate('/contracts/active')} 
              sx={{ 
                cursor: 'pointer', 
                pl: 4,
                bgcolor: isActive('/contracts/active') ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: isActive('/contracts/active') ? 'action.selected' : 'action.hover',
                }
              }}
            >
              <ListItemIcon>
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary="契約中一覧" />
            </ListItem>
            <ListItem 
              onClick={() => navigate('/domain-options')} 
              sx={{ 
                cursor: 'pointer', 
                pl: 4,
                bgcolor: isActive('/domain-options') ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: isActive('/domain-options') ? 'action.selected' : 'action.hover',
                }
              }}
            >
              <ListItemIcon>
                <Domain />
              </ListItemIcon>
              <ListItemText primary="独自ドメインオプション" />
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListSubheader>MANAGE</ListSubheader>
            <ListItem 
              onClick={() => navigate('/clients')} 
              sx={{ 
                cursor: 'pointer', 
                pl: 4,
                bgcolor: isActive('/clients') ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: isActive('/clients') ? 'action.selected' : 'action.hover',
                }
              }}
            >
              <ListItemIcon>
                <Business />
              </ListItemIcon>
              <ListItemText primary="クライアント管理" />
            </ListItem>
            <ListItem 
              onClick={() => navigate('/')} 
              sx={{ 
                cursor: 'pointer', 
                pl: 4,
                bgcolor: isActive('/') ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: isActive('/') ? 'action.selected' : 'action.hover',
                }
              }}
            >
              <ListItemIcon>
                <Dashboard />
              </ListItemIcon>
              <ListItemText primary="契約管理" />
            </ListItem>
            <ListItem 
              onClick={() => navigate('/plans')} 
              sx={{ 
                cursor: 'pointer', 
                pl: 4,
                bgcolor: isActive('/plans') ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: isActive('/plans') ? 'action.selected' : 'action.hover',
                }
              }}
            >
              <ListItemIcon>
                <CardMembership />
              </ListItemIcon>
              <ListItemText primary="プラン管理" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}; 