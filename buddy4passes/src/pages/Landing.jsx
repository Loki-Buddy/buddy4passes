// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import "../styles/Landing.css";
import {Header} from '../components/Header';
import {Footer} from '../components/Footer';

export function Landing() {
  return (
    <main className="landing-hero">
    <div className="header">
        <Header />
      </div>
      <div className="hero-wrapper">
      <div className="hero-content-register">
        <h1>Neu hier? </h1>
        <p>Registriere dich jetzt!</p>
        <div className="hero-ctas">
          <Link to="/register" className="btn">Registrieren</Link>
        </div>
      </div>
      <div className="hero-content-login">
        <h1>Schon registriert?</h1>
        <p>Melde dich jetzt an!</p>
        <div className="hero-ctas">
          <Link to="/login" className="btn">Login</Link>
        </div>
      </div>
      </div>

    <div className="footer"><Footer /></div>
    </main>
  );
}