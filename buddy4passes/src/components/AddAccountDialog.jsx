import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import { invoke } from "@tauri-apps/api/core";
import { useSnackbar } from "./SnackbarContext";
import { DialogActions, MenuItem } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddAccountDialogSlide({ open, onClose, onSubmit }) {
  // Account
  const [service, setService] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Gruppen
  const [groupId, setGroupId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [newGroupDialog, setNewGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const { showSnackbar } = useSnackbar();

  // Gruppen laden
  useEffect(() => {
    if (open) {
      invoke("get_groups")
        .then((res) => setGroups(Array.isArray(res) ? res : []))
        .catch((err) =>
          console.error("Fehler beim Laden der Gruppen: ", err)
        );
    }
  }, [open]);

  // Neue Gruppe anlegen
  async function handleAddGroup() {
    if (!newGroupName.trim()) return;

    try {
      console.log("Adding new group:", newGroupName);

      const result = await invoke("add_group", {
        groupname: newGroupName,
      });

      // Gruppe lokal hinzufügen
      const newLocalId = Date.now();

      setGroups((old) => [...(Array.isArray(old) ? old : []), { id: newLocalId, name: newGroupName }]);
      setGroupId(newLocalId);

      showSnackbar(`Gruppe "${newGroupName}" angelegt!`);
      setNewGroupDialog(false);
      setNewGroupName("");
    } catch (e) {
      console.error("Fehler beim Anlegen der Gruppe:", e);
      showSnackbar("Fehler beim Anlegen der Gruppe", "error");
    }
  }

  // Account speichern
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await invoke("add_account", {
        servicename: service,
        serviceemail: email,
        serviceusername: username,
        servicepassword: password,
        servicegroupid: groupId,
      });

      // Felder zurücksetzen
      setService("");
      setEmail("");
      setUsername("");
      setPassword("");
      setGroupId(null);

      await onSubmit?.();

      showSnackbar("Eintrag erfolgreich hinzugefügt!");
      onClose();
    } catch (err) {
      console.error("Fehler beim Aufruf:", err);
      showSnackbar("Fehler beim Hinzufügen!", "error");
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        keepMounted
        TransitionComponent={Transition}
      >
        <DialogTitle>Eintrag hinzufügen</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2} sx={{ width: 250, mt: 1 }}>
              <TextField
                label="Service"
                variant="outlined"
                required
                value={service}
                onChange={(e) => setService(e.target.value)}
              />

              <TextField
                label="Email"
                type="email"
                variant="outlined"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                label="Username"
                type="text"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                label="Passwort"
                type="password"
                variant="outlined"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  select
                  label="Gruppe"
                  variant="outlined"
                  required
                  fullWidth
                  value={groupId ?? ""}
                  onChange={(e) => setGroupId(Number(e.target.value))}
                >
                  {groups.length > 0 ? (
                    groups.map((g) => (
                      <MenuItem key={g.id} value={g.id}>
                        {g.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Keine Gruppen vorhanden</MenuItem>
                  )}
                </TextField>

                <Button
                  variant="outlined"
                  onClick={() => setNewGroupDialog(true)}
                >
                  +
                </Button>
              </Stack>
            </Stack>

            <DialogActions>
              <Button variant="outlined" onClick={onClose}>
                Abbrechen
              </Button>
              <Button variant="contained" type="submit">
                Hinzufügen
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={newGroupDialog}
        onClose={() => setNewGroupDialog(false)}
      >
        <DialogTitle>Neue Gruppe anlegen</DialogTitle>
        <DialogContent>
          <TextField
            label="Gruppenname"
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewGroupDialog(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleAddGroup}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
