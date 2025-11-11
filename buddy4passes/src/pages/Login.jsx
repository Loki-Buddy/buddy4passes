// src/pages/Login.jsx
import { Link } from "react-router-dom";



export function Login() {
  return (
    <main style={{ padding: 20, textAlign: "center" }}>
      <h2>Login</h2>
      <p>Diese Login-Seite ist noch ein Platzhalter. Implementiere hier das Formular.</p>
        <Link to="/" className="btn primary">zurück</Link>
    </main>
  );
}