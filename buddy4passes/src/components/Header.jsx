import "../styles/Header.css"; 
import mellonwo from "../assets/mellonwo.png";

export function Header() {
  return (
    <main className="header">
      
        <div className="logo"><img src={mellonwo} alt="mellonwo" /></div>
    </main>
  );
}