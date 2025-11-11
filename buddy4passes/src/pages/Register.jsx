import { Link } from "react-router-dom";
import {Header} from '../components/Header';
import {Footer} from '../components/Footer';



export function Register() {
  return (
    <main className="Register">
      <Header />
      <h2>Register</h2>
      <p>Diese Registrierungs-Seite ist noch ein Platzhalter. Implementiere hier das Formular.</p>
        <Link to="/" className="btn primary">zurück</Link>
      <Footer />
    </main>
  );
}