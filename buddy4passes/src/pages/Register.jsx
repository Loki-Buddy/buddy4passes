import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import RegistrationForm from "../components/RegistrationForm";
import "../styles/Register.css";

export function Register() {
  return (
    <main className="Register">
      <Header />
      <h2>Registrierung</h2>
      <RegistrationForm />
      <Footer />
    </main>
  );
}
