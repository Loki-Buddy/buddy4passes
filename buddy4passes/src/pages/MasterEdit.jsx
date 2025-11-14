import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { invoke } from "@tauri-apps/api/core";
import "./../styles/MasterEdit.css";

export function MasterEdit() {
    return (
        <main className="MasterEdit">
            <Header />
            <h2>MasterEdit</h2>
            <Footer />
        </main>
    );
}