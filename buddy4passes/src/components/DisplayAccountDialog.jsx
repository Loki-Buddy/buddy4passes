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
  Snackbar,
  InputAdornment,
  Tooltip,
  IconButton,
} from "@mui/material";
import { invoke } from "@tauri-apps/api/core";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

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

  const [editService, setEditService] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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
      setShowPassword(false);
    }
  }, [account]);

  if (!account) return null;

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      let data = {
        service: service,
        service_email: email,
        service_username: username,
        service_password: password,
      };

      await invoke("change_account_creds", {
        data,
        accountid: account.account_id,
      });

      setSnackbarMessage("Eintrag erfolgreich geändert!");
      setSnackbarOpen(true);

      if (onSubmit) await onSubmit();
    } catch (err) {
      console.error("Fehler beim Ändern:", err);
      setSnackbarMessage("Fehler beim Ändern des Eintrags.");
      setSnackbarOpen(true);
    }
  }

  const isEdited = editService || editEmail || editUsername || editPassword;

  const iconStyle = { cursor: "pointer", "&:hover": { color: "#1976d2" } };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      keepMounted
      aria-describedby="alert-dialog-slide-description"
      slots={{ transition: Transition }}
    >
      <DialogTitle>{account.service}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleUpdate}>
          <Stack spacing={2} sx={{ width: "300px", mt: 1 }}>
            <TextField
              label="Service"
              variant="outlined"
              required
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
              required
              disabled={!editEmail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Bearbeiten">
                      <IconButton
                        size="small"
                        onClick={() => setEditEmail(true)}
                      >
                        <EditIcon sx={iconStyle} />
                      </IconButton>
                    </Tooltip>
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
                    <Tooltip title="Bearbeiten">
                      <IconButton
                        size="small"
                        onClick={() => setEditUsername(true)}
                      >
                        <EditIcon sx={iconStyle} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Passwort"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              required
              disabled={!editPassword}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={
                        showPassword
                          ? "Passwort verbergen"
                          : "Passwort anzeigen"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="In Zwischenablage kopieren">
                      <IconButton
                        size="small"
                        onClick={() => navigator.clipboard.writeText(password)}
                      >
                        <ContentCopyIcon sx={iconStyle} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Bearbeiten">
                      <IconButton
                        size="small"
                        onClick={() => setEditPassword(true)}
                      >
                        <EditIcon sx={iconStyle} />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
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
      <Snackbar
        open={snackbarOpen}
        onClose={() => {
          setSnackbarOpen(false);
          onClose();
        }}
        autoHideDuration={2000}
        message={snackbarMessage}
      />
    </Dialog>
  );
}
