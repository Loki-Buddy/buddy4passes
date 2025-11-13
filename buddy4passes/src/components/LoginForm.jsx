import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Link } from "react-router-dom";
import "../styles/Loginform.css";

export function LoginForm() {
return (
<main className="login-form">
      <p>
<TextField
helperText=" "
id="demo-helper-text-aligned-no-helper"
label="Username"
/>
    </p>
    <p>
<TextField 
helperText=" "
id="demo-helper-text-aligned-no-helper"
label="Passwort"
/>
</p>
<p>
    <Link to="/" className="btn">Login</Link>
</p>
<p>
    <Link to="/" className="btn">zurück</Link>
</p>
    </main>
);
}