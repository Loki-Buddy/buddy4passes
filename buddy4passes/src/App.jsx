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
      email: "test@testemail2.de",
      masterpassword: "test",
    };

    const response = await invoke("register_user_test", { name: data.name, email: data.email, masterpassword: data.masterpassword });
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }
  async function chmastercreds() {
    const username = "lokii";
    const data = {
      new_user_name: "Jan",
      /* old_master_password: "test",
      new_master_password: "testNEW",
      confirm_new_master_password: "testNEW", */
    };

    const response = await invoke("change_master_creds", { username, data });
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }
  async function deleteUser() {
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }

  async function registerUser() {
    const data = {
      name: "lokii",
      email: "test@lokii.de",
      masterpassword: "jany1001!",
    };

    const response = await invoke("register_user_test", { name: data.name, email: data.email, masterpassword: data.masterpassword });
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }

  async function login() {
    const data = {
      username: "lokii",
      masterpassword: "jany1001!",
    };

    const response = await invoke("login_user", { username: data.username, masterpassword: data.masterpassword });
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
          //login();
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
