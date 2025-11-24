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
import { useSnackbar } from "../contexts/SnackbarContext";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DisplayAccountDialogSlide({
  open,
  onClose,
  onSubmit,
  account,
  fetchGroups,
  groups,
}) {
  const [service, setService] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [groupName, setGroupName] = useState("");

  // Gruppen
  const [groupId, setGroupId] = useState(null);

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

      setEditService(false);
      setEditEmail(false);
      setEditUsername(false);
      setEditPassword(false);
      setEditGroup(false);
      setShowPassword(false);
    }
  }, [account]);

  if (!groups) return null;
  useEffect(() => {
    if (account && groups && groups.length > 0) {
      const groupIdToSet = account.group_id || null;
      setGroupId(groupIdToSet);

      const group = groups.find((g) => g.group_id === account.group_id);
      setGroupName(group ? group.group_name : "");
    }
  }, [account, groups]);

  if (!account) return null;
  async function handleUpdate(e) {
    e.preventDefault();

    try {
      const data = {
        service,
        service_email: email,
        service_username: username,
        service_password: password,
        group_id: groupId,
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
                        <IconButton
                          size="small"
                          onClick={() => setEditService(true)}
                        >
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
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {" "}
                      <Tooltip title="In Zwischenablage kopieren">
                        {" "}
                        <IconButton
                          size="small"
                          onClick={() => navigator.clipboard.writeText(email)}
                        >
                          {" "}
                          <ContentCopyIcon sx={iconStyle} />{" "}
                        </IconButton>{" "}
                      </Tooltip>{" "}
                      <Tooltip title="Bearbeiten">
                        {" "}
                        <IconButton
                          size="small"
                          onClick={() => setEditEmail(true)}
                        >
                          {" "}
                          <EditIcon sx={iconStyle} />{" "}
                        </IconButton>{" "}
                      </Tooltip>{" "}
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Username"
                variant="outlined"
                disabled={!editUsername}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {" "}
                      <Tooltip title="In Zwischenablage kopieren">
                        {" "}
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigator.clipboard.writeText(username)
                          }
                        >
                          {" "}
                          <ContentCopyIcon sx={iconStyle} />{" "}
                        </IconButton>{" "}
                      </Tooltip>{" "}
                      <Tooltip title="Bearbeiten">
                        {" "}
                        <IconButton
                          size="small"
                          onClick={() => setEditUsername(true)}
                        >
                          {" "}
                          <EditIcon sx={iconStyle} />{" "}
                        </IconButton>{" "}
                      </Tooltip>{" "}
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Passwort"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                disabled={!editPassword}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {" "}
                      <Tooltip
                        title={
                          showPassword
                            ? "Passwort verbergen"
                            : "Passwort anzeigen"
                        }
                      >
                        {" "}
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {" "}
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}{" "}
                        </IconButton>{" "}
                      </Tooltip>{" "}
                      <Tooltip title="In Zwischenablage kopieren">
                        {" "}
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigator.clipboard.writeText(password)
                          }
                        >
                          {" "}
                          <ContentCopyIcon sx={iconStyle} />{" "}
                        </IconButton>{" "}
                      </Tooltip>{" "}
                      <Tooltip title="Bearbeiten">
                        {" "}
                        <IconButton
                          size="small"
                          onClick={() => setEditPassword(true)}
                        >
                          {" "}
                          <EditIcon sx={iconStyle} />{" "}
                        </IconButton>{" "}
                      </Tooltip>{" "}
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                select
                label="Gruppe (optional)"
                variant="outlined"
                fullWidth
                value={groupId ?? ""}
                onChange={(e) => {
                  setGroupId(e.target.value ? Number(e.target.value) : null);
                  setEditGroup(true);
                }}
              >
                <MenuItem value="">
                  <em>Keine Gruppe</em>
                </MenuItem>
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
