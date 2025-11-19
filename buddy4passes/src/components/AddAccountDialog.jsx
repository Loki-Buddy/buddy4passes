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
import { DialogActions } from "@mui/material";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddAccountDialogSlide({ open, onClose, onSubmit }) {
  const [service, setService] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Gruppen 
  const [groupId, setGroupId] = useState("");
  const [groups, setGroups] = useState("");

  const [newGroupDialog, setNewGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if(open) {
      invoke("get_groups")
        .then((res) => setGroups(res))
        .catch((err) => 
          console.error("Fehler beim Laden der Gruppen: ", err)
        );
    }
  }, [open]);

  // Gruppe erstellen
  async function handleAddGroup() {
    if (!newGroupName.trim()) return;

    try {
      const result = await invoke("add_group", {
        groupname: newGroupName,
      });

      setGroups((old) => [
        ...old,
        {id: Date.now(), name: newGroupName},
      ]);

      setGroupId(newGroupName);

      showSnackbar('Gruppe "${newGroupName}" angelegt!');
      setNewGroupDialog(false);
      setNewGroupName("");
    } catch (e) {
      console.error(e);
      showSnackbar("Fehler beim Anlegen der Gruppe", "error");
    }
  }

  // Account speichern
  async function handleSubmit(e) {
    e.preventDefault();

    const data = {
      service,
      email,
      username,
      password,
      groupid,
    };
    try {
      const response = await invoke("add_account", {
        servicename: data.service,
        serviceemail: data.email,
        serviceusername: data.username,
        servicepassword: data.password,
        servicegroupid: data.groupid,
      });

      setEmail("");
      setService("");
      setUsername("");
      setPassword("");
      setGroupId("");

      if (onSubmit) {
        await onSubmit();
      }

      showSnackbar(`Eintrag erfolgreich hinzugefügt!`);

      onClose();
    } catch (err) {
      console.error("Fehler beim Aufruf:", err);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      aria-describedby="alert-dialog-slide-description"
      slots={{ transition: Transition }}
    >
      <DialogTitle>{"Eintrag hinzufügen"}</DialogTitle>
      <DialogContent>
        <form onSubmit={(e) => handleSubmit(e)}>
          <Stack spacing={2} sx={{ width: "250px", mt: 1 }}>
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

            <TextField
              select
              label="Gruppe"
              variant="outlined"
              required
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            >
              {groups.map((g) => (
                <MenuItem key={g.id} value={g.id}>
                  {g.name}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              onClick={() => setNewGroupDialog(true)}
              >
                +
              </Button>
          </Stack>
          <br />
          <DialogActions>
          <Button sx={{ margin: "5px" }} variant="outlined" onClick={onClose}>
            Abbrechen
          </Button>
          <Button sx={{ margin: "5px" }} variant="contained" type="submit">
            Hinzufügen
          </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}
