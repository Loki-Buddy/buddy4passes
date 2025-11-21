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
import { useSnackbar } from "../contexts/SnackbarContext";
import { DialogActions, MenuItem } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddAccountDialogSlide({ open, onClose, onSubmit, fetchGroups, groups }) {
  // Account
  const [service, setService] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Gruppen
  const [groupId, setGroupId] = useState(null);
  const [newGroupDialog, setNewGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const { showSnackbar } = useSnackbar();





  // Neue Gruppe anlegen
  async function handleAddGroup() {
    if (!newGroupName.trim()) return;

    try {
      const result = await invoke("add_group", {
        groupname: newGroupName,
      });

      showSnackbar(`Gruppe "${newGroupName}" angelegt!`);

      setNewGroupName("");
      setNewGroupDialog(false);

      if (result.group_id) {
        setGroupId(result.group_id);
      }
      // Gruppenliste nach kurzem Delay aktualisieren
      await fetchGroups();
    } catch (e) {
      showSnackbar("Fehler beim Anlegen der Gruppe: " + e, "error");
    }
  }

  // Account speichern
  async function handleSubmit(e) {
    e.preventDefault();

    console.log("Ausgewählte Group ID:", groupId); // <- So siehst du die ID

    try {
      await invoke("add_account", {
        servicename: service,
        serviceemail: email,
        serviceusername: username,
        servicepassword: password,
        groupid: groupId,  // <- Wird hier bereits übergeben
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

  // Beispiel: Ausgewählte Gruppe als Objekt finden
  const selectedGroup = groups.find(g => g.group_id === groupId);

  // Dann kannst du zugreifen auf:
  // selectedGroup?.group_id   -> Die ID
  // selectedGroup?.group_name -> Der Name

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        keepMounted
        TransitionComponent={Transition}
        disableRestoreFocus  // <- Hinzugefügt
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
                  label="Gruppe (optional)"
                  variant="outlined"
                  fullWidth
                  value={groupId ?? ""}
                  onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : null)}
                >
                  {groups.length > 0 ? (
                    groups.map((g) => (
                      <MenuItem key={g.group_id} value={g.group_id}>
                        {g.group_name}
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
        disableRestoreFocus
        disableEnforceFocus  // <- Zusätzlich hinzugefügt
      >
        <DialogTitle>Neue Gruppe anlegen</DialogTitle>
        <DialogContent>
          <TextField
            sx={{
              mt: 1
            }}
            label="Gruppenname"
            fullWidth
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            autoFocus  // <- Fokus direkt ins Textfeld
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
