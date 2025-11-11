import { Link } from "react-router-dom";

export function Register() {
  return (
    <main style={{ padding: 20, textAlign: "center" }}>
      <h2>Register</h2>
      <p>Diese Registrierungs-Seite ist noch ein Platzhalter. Implementiere hier das Formular.</p>
        <Link to="/" className="btn primary">zurück</Link>

    </main>
  );
}