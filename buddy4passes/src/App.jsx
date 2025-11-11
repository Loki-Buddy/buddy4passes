import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  async function registerUser() {
    const data = {
      name: "test",
      email: "test@testtest.de",
      masterpassword: "test",
    };

    const response = await invoke("register_user_test", { name: data.name, email: data.email, masterpassword: data.masterpassword });
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }
  async function chmastercreds() {
    const userName = "test";
    const data = {
      new_user_name: "testNEWW",
      new_user_email: "testNEWWW.de",
      /* old_master_password: "testNEW",
      new_master_password: "testNEWW",
      confirm_new_master_password: "testNE", */
    };

    const response = await invoke("change_master_creds", { data, userName });
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }
  async function deleteUser() {
    const email = "test@testtestNEWWW.de";
    const response = await invoke("delete_user", { email });
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }

  return (
    <main className="container">
      <h1>Welcome to buddy4passes</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          //registerUser();
          chmastercreds();
          //deleteUser();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
