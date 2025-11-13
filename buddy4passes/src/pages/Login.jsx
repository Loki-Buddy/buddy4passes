// src/pages/Login.jsx
import { Link } from "react-router-dom";
import {Header} from '../components/Header';
import {Footer} from '../components/Footer';



export function Login() {
  return (
    <main className="Login">
      <Header />
      <h2>Login</h2>
      <p>Diese Login-Seite ist noch ein Platzhalter. Implementiere hier das Formular.</p>
        <Link to="/" className="btn primary">zurück</Link>
      <Footer />
    </main>
  );
}