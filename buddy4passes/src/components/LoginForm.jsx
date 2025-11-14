import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { invoke } from "@tauri-apps/api/core";
import Snackbar from "@mui/material/Snackbar";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function LoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [masterpassword, setMasterpassword] = useState("");

  const [userNameValidationError, setUsernameValidationError] = useState("");
  const [masterPasswordValidationError, setPasswordValidationError] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (masterpassword === "") {
      setPasswordValidationError("Passwort darf nicht leer sein");
      return;
    } else {
      setPasswordValidationError("");
    }

    if (username === "") {
      setUsernameValidationError("Benutzername darf nicht leer sein");
      return;
    } else {
      setUsernameValidationError("");
    }

    const data = {
      username,
      masterpassword,
    };
    try {
      const response = await invoke("login_user", data);
      if (response.message === "Login erfolgreich! (Token gespeichert)") {
        setSnackbarMessage("Login erfolgreich!");
        setSnackbarOpen(true);
        navigate("/dashboard");
      } else
        {
        setPasswordValidationError(response.message);
      }
    } catch (err) {
      console.error("Fehler beim Aufruf:", err);
      setSnackbarMessage("Fehler beim Login. Bitte überprüfe deine Eingaben.");
      setSnackbarOpen(true);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Username"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={userNameValidationError !== ""}
        helperText={userNameValidationError}
        margin="normal"
      />
      <TextField
        label="Passwort"
        variant="outlined"
        type="password"
        value={masterpassword}
        onChange={(e) => setMasterpassword(e.target.value)}
        error={masterPasswordValidationError !== ""}
        helperText={masterPasswordValidationError}
        margin="normal"
      />
      <br />
      <Button
        sx={{ margin: "5px" }}
        component={Link}
        to="/"
        variant="outlined"
        color="primary"
        >
        Zurück
      </Button>
      <Button 
        sx={{ margin: "5px" }} 
        type="submit"
        variant="contained" 
        color="primary">
        Login
      </Button>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </form>
  );
}

export default LoginForm;