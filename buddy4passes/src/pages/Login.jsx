// src/pages/Login.jsx
import { Link } from "react-router-dom";
import {Header} from '../components/Header';
import {Footer} from '../components/Footer';
import { LoginForm } from '../components/LoginForm';
import "../styles/Login.css";



export function Login() {
  return (
    <main className="login">
      <Header />
      <LoginForm />
      <Footer />
    </main>
  );
}