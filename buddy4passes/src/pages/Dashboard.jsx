import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import "../styles/Dashboard.css";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountCard from "../components/AccountCard";
import Box from "@mui/material/Box";
import AddAccountDialogSlide from "../components/AddAccountDialog";
import Tooltip from "@mui/material/Tooltip";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DisplayAccountDialogSlide from "../components/DisplayAccountDialog";
import { Button } from "@mui/material";
import benutzerIcon from "../assets/benutzer.png";

export function Dashboard() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAccountInfo, setSelectedAccountsInfo] = useState(null);
  const [openAddAccountDialog, setOpenAddAccountDialog] = useState(false);
  const [openDisplayAccountDialog, setOpenDisplayAccountDialog] = useState(false);

  async function fetchAccounts() {
    try {
      const response = await invoke("display_accounts");

      if (response.message) {
        setMessage(response.message);
        return;
      }
      const sortedAccounts = response.sort(
        (a, b) => a.account_id - b.account_id
      );
      setMessage("");
      console.log(sortedAccounts);
      setAccounts(sortedAccounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

async function handleAddTestGroup() {
      try {
    const response = await invoke("get_groups");

    if (!response.success) {
      console.error(`Fehler: ${response.message}`);
      return;
    }

    console.log("Gruppen erfolgreich abgerufen:");
    console.log(response.groups); // gesamte Liste

    // Optional: schön formatiert ausgeben
    response.groups.forEach((group) => {
      console.log(`ID: ${group.group_id} | Name: ${group.group_name}`);
    });

  } catch (error) {
    console.error("Unerwarteter Fehler:", error);
  }
}
  return (
    <main className="Dashboard">
      <Header />
      <Button 
        onClick={() => navigate("/masteredit")}
        sx={{ 
          position: "fixed",
          top: "1rem",
          right: "1rem",
          zIndex: 1000
        }}
      >
        <img 
          src={benutzerIcon} 
          className="logo" 
          alt="dashboard"
          style={{ width: "24px", height: "24px", marginRight: "8px", opacity: 0.6 }}
        />
        Profil
      </Button>
      <h2>Dashboard</h2>
 <button 
        onClick={handleAddTestGroup} 
        style={{
          marginBottom: "20px",
          padding: "8px 14px",
          cursor: "pointer"
        }}
      >
        Testgruppe hinzufügen
      </button>
      
      <Box
        sx={{
          p: 2
        }}
      >
        <div className="account-list">
          <Tooltip title="Eintrag hinzufügen">
            <AddCircleIcon
              fontSize="large"
              onClick={() => {
                setOpenAddAccountDialog(true);
                setSelectedAccount(null);
              }}
              sx={{
                color: "rgba(255, 255, 255, 0.75)",
                cursor: "pointer",
                "&:hover": {
                  color: "rgb(135, 206, 250)",
                },
              }}
            />
          </Tooltip>
          {message ? (
            <p>{message}</p>
          ) : (
            accounts.map((account) => (
              <AccountCard
                key={account.account_id}
                account_id={account.account_id}
                service={account.service}
                selected={selectedAccount === account.account_id}
                onSelect={() => {
                  setSelectedAccount(account.account_id);
                  setSelectedAccountsInfo(account);
                  setOpenDisplayAccountDialog(true);
                }}
              />
            ))
          )}
        </div>
      </Box>
      <AddAccountDialogSlide
        open={openAddAccountDialog}
        onClose={() => setOpenAddAccountDialog(false)}
        onSubmit={fetchAccounts}
      />
      <DisplayAccountDialogSlide
        open={openDisplayAccountDialog}
        onClose={() => {
          setOpenDisplayAccountDialog(false);
          setSelectedAccountsInfo(null);
        }}
        onSubmit={fetchAccounts}
        account={selectedAccountInfo}
      />
      <Footer />
    </main>
  );
}

export default Dashboard;
