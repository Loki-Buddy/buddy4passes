import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { invoke } from "@tauri-apps/api/core";
import EditIcon from "@mui/icons-material/Edit";
import InputAdornment from "@mui/material/InputAdornment";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { useState, useEffect } from "react";
import "./../styles/MasterEdit.css";

export function MasterEdit({ onSubmit }) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [oldusername, setOldUsername] = useState("");
    const [oldemail, setOldEmail] = useState("");

    const [newpassword, setPassword] = useState("");
    const [oldpassword, setOldPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [editEmail, setEditEmail] = useState(false);
    const [editUsername, setEditUsername] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [changePassword, setChangePassword] = useState(false);

    const [emailValidationError, setEmailValidationError] = useState("");
    const [usernameValidationError, setUsernameValidationError] = useState("");
    const [passwordValidationError, setPasswordValidationError] = useState("");

    async function fetchData() {
        try {
            const response = await invoke("fetch_data");

            //console.log("MasterCreds geladen:", response);

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
    async function handleSubmit(e) {
        e.preventDefault();

        if (newpassword !== confirmPassword) {
            setPasswordValidationError("Passwörter stimmen nicht überein");
            return;
        } else {
            setPasswordValidationError("");
        }

        let data = {
            /* new_master_password: newpassword,
            old_master_password: oldpassword,
            confirm_new_master_Password: confirmPassword, */
        };

        if (username !== oldusername) {
            data.new_user_name = username;
        }

        if (email !== oldemail) {
            data.new_user_email = email;
        }
        console.log(data, username);
        const response = await invoke("change_master_creds", {
            data,
            username: oldusername,
        });

        if (response.message){
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
        }
        setEditEmail(false);
        setEditUsername(false);
        fetchData();
        console.log("MasterCreds geändert:", response);
    }

    return (
        <main className="MasterEdit">
            <Header />
            <h2>MasterEdit</h2>
            <div className="master">
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="E-Mail"
                        type="email"
                        value={email}
                        disabled={!editEmail}
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
                        label="Benutzername"
                        variant="outlined"
                        type="text"
                        value={username}
                        onChange={(e) => {setUsername(e.target.value); console.log("Username:", e.target.value);}}
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
                    <Button onClick={() => setChangePassword(!changePassword)}>Passwort Ändern</Button>
                    {changePassword && (
                        <div>
                            <TextField
                                label="Altes Passwort"
                                type="password"
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                            <TextField
                                label="Neues Passwort"
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <TextField
                                label="Passwort bestätigen"
                                type="password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <Button type="submit">Speichern</Button>                    
                </form>
            </div>
            <Footer />
        </main>
    );
}