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

  async function chmastercreds() {
    const username = "Sebs1";
    const data = {
      new_user_name: "Sebs2",
      new_user_email: "sebs@mail.de",
      old_master_password: "test",
      new_master_password: "test2",
      confirm_new_master_password: "test2",
    };

    const response = await invoke("change_master_creds", {
      username,
      data,
    });
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }
  async function loginUser() {
    const username = "Sebs1";
    const masterpassword = "test";
    const response = await invoke("login_user", { username, masterpassword });
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }

  async function addAccount() {
    const data = {
      service: "Google",
      service_email: "Sebs@gmail.com",
      service_username: "Sebs",
      service_password: "PW123",
    };

    try {
      const response = await invoke("add_account", {
        servicename: data.service,
        serviceemail: data.service_email,
        serviceusername: data.service_username,
        servicepassword: data.service_password,
      });

      console.log("Server response:", response);
      console.log("Typ der response:", typeof response);
      console.log("message:", response.message);

      if (response.success) {
        alert(`${response.message}`);
      } else {
        alert(`${response.message}`);
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Accounts:", error);
      alert(`Fehler: ${error}`);
    }
  }
  async function deleteAccount() {
  const account_id = 18;

  try {
    const response = await invoke("delete_account", {
      accountid: account_id,
    });

    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message:", response.message);

    if (response.success) {
      alert(`${response.message}`);
    } else {
      alert(`${response.message}`);
    }
  } catch (error) {
    console.error("Fehler beim Löschen des Accounts:", error);
    alert(`Fehler: ${error}`);
  }
}
  async function registerUser() {
    const data = {
      name: "Sebs1",
      email: "sebs@mail.de",
      masterpassword: "test",
    };

    const response = await invoke("register_user_test", {
      name: data.name,
      email: data.email,
      masterpassword: data.masterpassword,
    });
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }

  async function deleteUser() {
    const email = "sebs@mail.de";
    const username = "Sebs1";
    const response = await invoke("delete_user", { email, username });
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }
  async function loginUser() {
    const username = "Sebs1";
    const masterpassword = "test";
    const response = await invoke("login_user", { username, masterpassword });
    console.log("Server response:", response);
    console.log("Typ der response:", typeof response);
    console.log("message", response.message);
  }
  async function getAccount() {
    const response = await invoke("display_accounts");
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
          deleteUser();
          // registerUser();
          // addAccount();
          // loginUser();
          // deleteAccount();
          // getAccount();
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
