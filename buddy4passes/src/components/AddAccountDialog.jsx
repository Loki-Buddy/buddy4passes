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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AddAccountDialogSlide({ open, onClose, onSubmit }) {
  const [service, setService] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setService("");
      setEmail("");
      setUsername("");
      setPassword("");
    }
  }, [open]);

  async function handleSubmit(e) {
    e.preventDefault();

    const data = {
      service,
      email,
      username,
      password,
    };
    try {
      const response = await invoke("add_account", {
        servicename: data.service,
        serviceemail: data.email,
        serviceusername: data.username,
        servicepassword: data.password,
      });

      setEmail("");
      setService("");
      setUsername("");
      setPassword("");

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
          </Stack>
          <br />
          <Button sx={{ margin: "5px" }} variant="outlined" onClick={onClose}>
            Abbrechen
          </Button>
          <Button sx={{ margin: "5px" }} variant="contained" type="submit">
            Hinzufügen
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
