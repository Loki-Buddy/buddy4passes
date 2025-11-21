import { createContext, useContext, useState } from "react";
import Snackbar from "@mui/material/Snackbar";

const SnackbarContext = createContext();

export function SnackbarProvider({ children }) {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbarOpen}
        onClose={handleClose}
        autoHideDuration={4000}
        message={snackbarMessage}
      />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  return useContext(SnackbarContext);
}
