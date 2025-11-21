import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { invoke } from "@tauri-apps/api/core";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import InputAdornment from "@mui/material/InputAdornment";
import { IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState, useEffect } from "react";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useNavigate } from "react-router-dom";
import dashboardIcon from "../assets/dashboard.png";
import "./../styles/MasterEdit.css";

export function MasterEdit({ onSubmit }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [oldusername, setOldUsername] = useState("");
  const [oldemail, setOldEmail] = useState("");

  const [newpassword, setPassword] = useState("");
  const [oldpassword, setOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [editEmail, setEditEmail] = useState(false);
  const [editUsername, setEditUsername] = useState(false);

  const [changePassword, setChangePassword] = useState(false);

  const [emailValidationError, setEmailValidationError] = useState("");
  const [usernameValidationError, setUsernameValidationError] = useState("");
  const [passwordValidationError, setPasswordValidationError] = useState("");
  const [oldpasswortValidationError, setOldPasswordValidationError] =
    useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  async function fetchData() {
    try {
      const response = await invoke("fetch_data");

      setEmail(response.user_email);
      setUsername(response.user_name);
      setOldUsername(response.user_name);
      setOldEmail(response.user_email);
      return response;
    } catch (error) {
      console.error("Error fetching MasterCreds:", error);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

  const iconStyle = { cursor: "pointer", "&:hover": { color: "#1976d2" } };

  async function handleDelete(e) {
    try {
      e.preventDefault();

      const response = await invoke("delete_user", { email: email, username: username });
      showSnackbar(response.message);

      navigate("/");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
  async function handleSubmit(e) {
    try {
      e.preventDefault();

      let data = {};

      if (username !== oldusername) {
        data.new_user_name = username;
      }

      if (email !== oldemail) {
        data.new_user_email = email;
      }

      if (changePassword) {
        if (newpassword !== confirmPassword) {
          setPasswordValidationError("Passwörter stimmen nicht überein");
          return;
        }

        data.old_master_password = oldpassword;
        data.new_master_password = newpassword;
        data.confirm_new_master_password = confirmPassword;
      }

      const response = await invoke("change_master_creds", {
        data,
        username: oldusername,
      });

      if (response.message) {
        switch (response.message) {
          case "Benutzername bereits vergeben.":
            setUsernameValidationError("Nutzername wird bereits verwendet");
            return;
          case "Es existiert bereits ein Account mit dieser Email.":
            setEmailValidationError("E-Mail wird bereits verwendet");
            return;
          case "Änderungen erfolgreich gespeichert!":
            showSnackbar("Änderungen erfolgreich gespeichert!");
            break;
          case "Keine Daten gegeben!":
            showSnackbar("Keine Daten gegeben!");
            break;
          default:
            break;
        }
      }
      setEditEmail(false);
      setEditUsername(false);
      changePassword && setChangePassword(false);
      fetchData();
    } catch (error) {
      switch (error) {
        case "Verification failed":
          setOldPasswordValidationError("Altes Passwort ist falsch!");
          break;

        default:
          console.error("Error changing MasterCreds:", error);
          break;
      }
    }
  }

  return (
    <main className="MasterEdit">
      <Header />
      <Button
        onClick={() => navigate("/dashboard")}
        sx={{
          position: "fixed",
          top: "1rem",
          left: "1rem",
          zIndex: 1000,
        }}
      >
        <img
          src={dashboardIcon}
          className="logo"
          alt="dashboard"
          style={{
            width: "24px",
            height: "24px",
            marginRight: "8px",
            opacity: 0.6,
          }}
        />
        Dashboard
      </Button>
      <h2>Profil bearbeiten</h2>
      <Box
        sx={{
          minHeight: "70vh",
          minWidth: "80vw",
          backgroundColor: "rgba(255, 255, 255, 0.75)",
          border: "1px solid #ccc",
          borderRadius: "5px",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="master">
          <form onSubmit={handleSubmit}>
            <TextField
              label="E-Mail"
              type="email"
              value={email}
              disabled={!editEmail}
              error={emailValidationError !== ""}
              helperText={emailValidationError}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailValidationError("");
              }}
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
              label="Benutzername"
              variant="outlined"
              type="text"
              value={username}
              error={usernameValidationError !== ""}
              helperText={usernameValidationError}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameValidationError("");
              }}
              disabled={!editUsername}
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
            <Button onClick={() => setChangePassword(!changePassword)}>
              Passwort Ändern
            </Button>
            {changePassword && (
              <div>
                <TextField
                  label="Altes Passwort"
                  type="password"
                  error={oldpasswortValidationError !== ""}
                  helperText={oldpasswortValidationError}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    setOldPasswordValidationError("");
                  }}
                  required
                  fullWidth
                />
                <div>
                  <TextField
                    label="Neues Passwort"
                    type="password"
                    error={passwordValidationError !== ""}
                    helperText={passwordValidationError}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordValidationError("");
                    }}
                    required
                    fullWidth
                  />
                  <TextField
                    label="Passwort bestätigen"
                    type="password"
                    error={passwordValidationError !== ""}
                    helperText={passwordValidationError}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordValidationError("");
                    }}
                    required
                    fullWidth
                  />
                </div>
              </div>
            )}
            <Button type="submit">Speichern</Button>
            <Button onClick={() => setConfirmOpen(true)}
              sx={{
                color: 'red',
              }}>
              Account löschen
            </Button>
          </form>
        </div>
      </Box>
      <Footer />
      
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Account löschen?</DialogTitle>
        <DialogContent>
          Willst du deinen Account wirklich löschen? Dies kann nicht rückgängig
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
    </main>
  );
}
