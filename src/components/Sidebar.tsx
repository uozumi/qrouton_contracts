import React from 'react';
import { Link } from 'react-router-dom';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import DomainIcon from '@mui/icons-material/Domain';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const Sidebar: React.FC = () => {
  return (
    <div>
      <ListItemButton component={Link} to="/contracts">
        <ListItemIcon>
          <DescriptionIcon />
        </ListItemIcon>
        <ListItemText primary="契約一覧" />
      </ListItemButton>

      <ListItemButton component={Link} to="/contracts/active">
        <ListItemIcon>
          <DescriptionIcon />
        </ListItemIcon>
        <ListItemText primary="契約中一覧" />
      </ListItemButton>

      <ListItemButton component={Link} to="/clients">
        <ListItemIcon>
          <BusinessIcon />
        </ListItemIcon>
        <ListItemText primary="クライアント一覧" />
      </ListItemButton>

      <ListItemButton component={Link} to="/domain-options">
        <ListItemIcon>
          <DomainIcon />
        </ListItemIcon>
        <ListItemText primary="ドメインオプション一覧" />
      </ListItemButton>

      <ListItemButton component={Link} to="/plans">
        <ListItemIcon>
          <LocalOfferIcon />
        </ListItemIcon>
        <ListItemText primary="プラン一覧" />
      </ListItemButton>
    </div>
  );
};

export default Sidebar; 