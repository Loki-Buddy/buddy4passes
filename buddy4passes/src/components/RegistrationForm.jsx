import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import { invoke } from "@tauri-apps/api/core";
import Snackbar from "@mui/material/Snackbar";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "./SnackbarContext";

function RegistrationForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailValidationError, setEmailValidationError] = useState("");
  const [usernameValidationError, setUsernameValidationError] = useState("");
  const [passwordValidationError, setPasswordValidationError] = useState("");

  const { showSnackbar } = useSnackbar();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordValidationError("Passwörter stimmen nicht überein");
      return;
    } else {
      setPasswordValidationError("");
    }

    const data = {
      email,
      username,
      password,
    };
    try {
      const response = await invoke("register_user_test", {
        name: data.username,
        email: data.email,
        masterpassword: data.password,
      });

      switch (response.message) {
        case "Dieser Benutzername wird bereits von einem anderen User verwendet.":
          setUsernameValidationError("Nutzername wird bereits verwendet");
          return;
        case "Diese E-Mail wird bereits von einem anderen User verwendet.":
          setEmailValidationError("E-Mail wird bereits verwendet");
          return;
        default:
          break;
      }

      showSnackbar(
        `Registrierung erfolgreich! Du dich mit ${data.username} anmelden`
      );
      navigate("/login");
    } catch (err) {
      console.error("Fehler beim Aufruf:", err);
    }
  }

  return (
    <div className="registration-form">
      <form onSubmit={handleSubmit}>
        <TextField
          error={emailValidationError !== ""}
          helperText={emailValidationError}
          style={{ width: "200px", margin: "5px" }}
          type="email"
          label="Email"
          variant="outlined"
          required
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailValidationError("");
          }}
        />
        <TextField
          error={usernameValidationError !== ""}
          helperText={usernameValidationError}
          style={{ width: "200px", margin: "5px" }}
          type="text"
          label="Username"
          variant="outlined"
          required
          onChange={(e) => {
            setUsername(e.target.value);
            setUsernameValidationError("");
          }}
        />
        <TextField
          error={passwordValidationError !== ""}
          style={{ width: "200px", margin: "5px" }}
          type="password"
          label="Passwort"
          variant="outlined"
          required
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordValidationError("");
          }}
        />
        <TextField
          error={passwordValidationError !== ""}
          helperText={passwordValidationError}
          style={{ width: "200px", margin: "5px" }}
          type="password"
          label="Passwort bestätigen"
          variant="outlined"
          required
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setPasswordValidationError("");
          }}
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
          variant="contained"
          color="primary"
          type="submit"
        >
          Registrieren
        </Button>
      </form>
    </div>
  );
}

export default RegistrationForm;
