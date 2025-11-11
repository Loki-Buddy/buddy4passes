// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import "../styles/Landing.css";
// import Header from './Header';
// import Footer from './Footer';

export function Landing() {
  return (
    <main className="landing-hero">
    {/* <Header /> */}

      <div className="hero-content">
        <h1>Willkommen bei Mellon</h1>
        <p>Mit Mellon kannst du deine Passwörter sicher speichern und verwalten.</p>
        <div className="hero-ctas">
          <Link to="/login" className="btn primary">Login</Link>
          <Link to="/register" className="btn secondary">Registrieren</Link>
        </div>
      </div>
    {/* <Footer /> */}
    </main>
  );
}