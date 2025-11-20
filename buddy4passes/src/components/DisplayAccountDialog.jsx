import * as React from "react";
import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slide,
  TextField,
  Stack,
  InputAdornment,
  Tooltip,
  IconButton,
  MenuItem,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { invoke } from "@tauri-apps/api/core";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useSnackbar } from "./SnackbarContext";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DisplayAccountDialogSlide({
  open,
  onClose,
  onSubmit,
  account,
}) {
  const [service, setService] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Gruppen
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState([]);

  const [editService, setEditService] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [editGroup, setEditGroup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (account) {
      setService(account.service);
      setEmail(account.service_email);
      setUsername(account.service_username);
      setPassword(account.service_password);
      setGroupName(account.service_group_name || ""); 

      setEditService(false);
      setEditEmail(false);
      setEditUsername(false);
      setEditPassword(false);
      setEditGroup(false);
      setShowPassword(false);
    }
  }, [account]);

  useEffect(() => {
    if (open) {
      invoke("get_groups")
        .then((res) => setGroups(Array.isArray(res) ? res : []))
        .catch((err) => console.error("Fehler beim Laden der Gruppen: ", err));
    }
  }, [open]);

  if (!account) return null;

  async function handleUpdate(e) {
    e.preventDefault();

    try {
      // Wenn der eingegebene Gruppenname noch nicht existiert, zuerst anlegen
      let selectedGroupId = null;
      const existingGroup = groups.find((g) => g.name === groupName);
      if (existingGroup) {
        selectedGroupId = existingGroup.id;
      } else if (groupName.trim()) {
        const result = await invoke("add_group", { groupname: groupName });
        // ID?
        selectedGroupId = Date.now();
        setGroups((old) => [...old, { id: selectedGroupId, name: groupName }]);
      }

      const data = {
        service,
        service_email: email,
        service_username: username,
        service_password: password,
        service_group_id: selectedGroupId,
      };

      await invoke("change_account_creds", {
        data,
        accountid: account.account_id,
      });

      showSnackbar("Eintrag erfolgreich geändert!");
      onClose();
      await onSubmit?.();
    } catch (err) {
      console.error("Fehler beim Ändern:", err);
      showSnackbar("Fehler beim Ändern des Eintrags.");
    }
  }

  async function handleDelete() {
    try {
      await invoke("delete_account", { accountid: account.account_id });
      showSnackbar("Eintrag erfolgreich gelöscht!");
      setConfirmOpen(false);
      await onSubmit?.();
      onClose();
    } catch (err) {
      console.error("Fehler beim Löschen:", err);
      showSnackbar("Fehler beim Löschen des Eintrags.");
    }
  }

  const isEdited =
    editService || editEmail || editUsername || editPassword || editGroup;

  const iconStyle = { cursor: "pointer", "&:hover": { color: "#1976d2" } };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        keepMounted
        TransitionComponent={Transition}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {account.service}
          <Tooltip title="Löschen">
            <IconButton
              sx={{ cursor: "pointer", "&:hover": { color: "red" } }}
              onClick={() => setConfirmOpen(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </DialogTitle>

        <DialogContent>
          <form onSubmit={handleUpdate}>
            <Stack spacing={2} sx={{ width: 300, mt: 1 }}>
              <TextField
                label="Service"
                variant="outlined"
                disabled={!editService}
                value={service}
                onChange={(e) => setService(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Bearbeiten">
                        <IconButton size="small" onClick={() => setEditService(true)}>
                          <EditIcon sx={iconStyle} />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Email"
                type="email"
                variant="outlined"
                disabled={!editEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                label="Username"
                variant="outlined"
                disabled={!editUsername}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <TextField
                label="Passwort"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                disabled={!editPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Autocomplete
                freeSolo
                disableClearable
                options={groups.map((g) => g.name)}
                value={groupName}
                onChange={(e, newValue) => setGroupName(newValue)}
                onInputChange={(e, newValue) => setGroupName(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Gruppe"
                    variant="outlined"
                    disabled={!editGroup}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Bearbeiten">
                            <IconButton size="small" onClick={() => setEditGroup(true)}>
                              <EditIcon sx={iconStyle} />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Stack>

            <DialogActions>
              <Button variant="outlined" onClick={onClose}>
                Abbrechen
              </Button>
              {isEdited && (
                <Button variant="contained" type="submit">
                  Ändern
                </Button>
              )}
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Eintrag löschen?</DialogTitle>
        <DialogContent>
          Willst du diesen Eintrag wirklich löschen? Dies kann nicht rückgängig
          gemacht werden.
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setConfirmOpen(false)}>
            Abbrechen
          </Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
