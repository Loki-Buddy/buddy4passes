import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { invoke } from "@tauri-apps/api/core";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { useState, useEffect } from "react";
import "./../styles/MasterEdit.css";

export function MasterEdit( { onSubmit } ) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [oldusername, setOldUsername] = useState("");

    const [newpassword, setPassword] = useState("");
    const [oldpassword, setOldPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [emailValidationError, setEmailValidationError] = useState("");
    const [usernameValidationError, setUsernameValidationError] = useState("");
    const [passwordValidationError, setPasswordValidationError] = useState("");

    async function fetchData() {
        try {
            const response = await invoke("fetch_data");
            
            console.log("MasterCreds geladen:", response);
            
            setEmail(response.user_email);
            setUsername(response.user_name);
            setOldUsername(response.user_name);
            return response;
        } catch (error) {
            console.error("Error fetching MasterCreds:", error);
        }
    }
    useEffect(() => {
        fetchData();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();

        if (newpassword !== confirmPassword) {
            setPasswordValidationError("Passwörter stimmen nicht überein");
            return;
        } else {
            setPasswordValidationError("");
        }
        
        let data = {
            new_user_email: email,
            new_user_name: username,
            new_master_password: newpassword,
            old_master_password: oldpassword,
            confirm_new_master_Password: confirmPassword,
        };

        const response = await invoke("change_master_creds", {
            data,
            username: oldusername,
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
    }

    return (
        <main className="MasterEdit">
            <Header />
            <h2>MasterEdit</h2>
            <div className="master">
                <form onSubmit={handleSubmit}>
                </form>
            </div>
            <Footer />
        </main>
    );
}