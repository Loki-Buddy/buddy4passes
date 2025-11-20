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
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { invoke } from "@tauri-apps/api/core";
import { useSnackbar } from '../contexts/SnackbarContext';

export default function NestedList({ groups, onGroupAdded }) {
  const [open, setOpen] = React.useState(false);
  const [newGroupDialog, setNewGroupDialog] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState("");
  const { showSnackbar } = useSnackbar();

  const handleClick = () => setOpen(!open);

  async function handleGroupAdd(e) {
    e.preventDefault();
    if (newGroupName === "") {
      return;
    }
    const result = await invoke("add_group", { groupname: newGroupName });
    if (result.success === false) {
      showSnackbar("Fehler beim Hinzufügen der Gruppe");
      return;
    }
    showSnackbar("Gruppe erfolgreich hinzugefügt");
    setNewGroupDialog(false);

    // Optionally, you might want to refresh the groups list here
  }

  return (
    <><List
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
          <ListItemButton sx={{ pl: 4, width: '100%', minWidth: 0 }}
            onClick={() => setNewGroupDialog(true)}
          >
            <ListItemText primary="Neue Gruppe hinzufügen" />
          </ListItemButton>

          {groups.length > 0 && groups.map((group) => (
            <ListItemButton key={group.group_id} sx={{ pl: 4, width: '100%', minWidth: 0 }}>
              <ListItemText primary={group.group_name} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </List>

      <Dialog
        open={newGroupDialog}
        onClose={() => {
          setNewGroupDialog(false); setNewGroupName("");
        }}
      >
        <DialogTitle>Neue Gruppe anlegen</DialogTitle>
        <DialogContent>
          <form onSubmit={handleGroupAdd}>
            <TextField
              required
              label="Gruppenname"
              fullWidth
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              sx={{
                marginTop: 1
              }}
            />
            <DialogActions>
              <Button onClick={() => { setNewGroupDialog(false); setNewGroupName(""); }}>Abbrechen</Button>
              <Button variant="contained" type="submit">
                Speichern
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

    </>
  );
}
