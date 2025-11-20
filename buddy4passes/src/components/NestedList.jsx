import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';

export default function NestedList({ groups }) {
const [open, setOpen] = React.useState(false);

const handleClick = () => setOpen(!open);

return (
<List
sx={{ width: '100%', maxWidth: '100%', minWidth: 0, p: 0 }}
component="nav"
aria-labelledby="nested-list-subheader"
subheader={<ListSubheader component="div" id="nested-list-subheader" sx={{ p: 0 }} />}
>
<ListItemButton sx={{ width: '100%', minWidth: 0 }}>
<ListItemIcon sx={{ minWidth: '36px' }}> <StarBorder /> </ListItemIcon> <ListItemText primary="Favoriten" /> </ListItemButton>

  <ListItemButton onClick={handleClick} sx={{ width: '100%', minWidth: 0 }}>
    <ListItemText primary="Gruppen" />
    {open ? <ExpandLess /> : <ExpandMore />}
  </ListItemButton>

  <Collapse in={open} timeout="auto" unmountOnExit sx={{ width: '100%', minWidth: 0, display: 'block', overflowX: 'hidden' }}>
    <List component="div" disablePadding sx={{ width: '100%', minWidth: 0 }}>
      <ListItemButton sx={{ pl: 4, width: '100%', minWidth: 0 }}>
        <ListItemText primary="Neue Gruppe hinzufügen" />
      </ListItemButton>

      {groups.length > 0 && groups.map((group) => (
      <ListItemButton key={group.group_id} sx={{ pl: 4, width: '100%', minWidth: 0 }}>
        <ListItemText primary={group.group_name} />
      </ListItemButton>
      ))}

      {/* <ListItemButton sx={{ pl: 4, width: '100%', minWidth: 0 }}>
        <ListItemText primary="Gruppe 1" />
      </ListItemButton> */}
    </List>
  </Collapse>
</List>


);
}
