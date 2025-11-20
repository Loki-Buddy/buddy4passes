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
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Tooltip, IconButton } from '@mui/material';
import { invoke } from "@tauri-apps/api/core";
import { useSnackbar } from '../contexts/SnackbarContext';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


export default function NestedList({ groups, onGroupAdded }) {
  const [open, setOpen] = React.useState(false);
  const [newGroupDialog, setNewGroupDialog] = React.useState(false);
  const [editGroupDialog, setEditGroupDialog] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState("");
  const [editGroupName, setEditGroupName] = React.useState("");
  const { showSnackbar } = useSnackbar();

  const handleClick = () => setOpen(!open);
  const iconStyle = { cursor: "pointer", "&:hover": { color: "#1976d2" } };

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
    onGroupAdded();
    setNewGroupName("");
    setNewGroupDialog(false);
  }

  async function handleGroupEdit(e) {
    e.preventDefault();
    if (editGroupName.group_name === "") {
      showSnackbar("Gruppenname darf nicht leer sein");
      return;
    }
    const group_edit = { group_id: editGroupName.group_id, new_group_name: editGroupName.group_name }
    const result = await invoke("edit_group", { group: group_edit });
    if (result.success === false) {
      showSnackbar("Fehler beim Aktualisieren der Gruppe");
      return;
    }
    showSnackbar("Gruppe erfolgreich aktualisiert");
    onGroupAdded();
    setEditGroupName("");
    setEditGroupDialog(false);
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

              <IconButton
                size="small"
              >
                {" "}
                <EditIcon sx={iconStyle} onClick={() => { setEditGroupDialog(true); setEditGroupName(group); }} />{" "}
              </IconButton>{" "}
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

      <Dialog
        open={editGroupDialog}
        onClose={() => {
          setEditGroupDialog(false); setEditGroupName("");
        }}
      >
        <DialogTitle>Gruppe umbenennen</DialogTitle>
        <DialogContent>
          <form onSubmit={handleGroupEdit}>
            <TextField
              label="Gruppenname"
              fullWidth
              value={editGroupName.group_name}
              onChange={(e) => setEditGroupName({ ...editGroupName, group_name: e.target.value })}
              sx={{
                marginTop: 1
              }}
            />
            <DialogActions>
              <Button onClick={() => { setEditGroupDialog(false); setEditGroupName(""); }}>Abbrechen</Button>
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
