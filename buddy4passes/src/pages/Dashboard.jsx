import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import "../styles/Dashboard.css";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import AccountCard from "../components/AccountCard";
import Box from "@mui/material/Box";
import AddAccountDialogSlide from "../components/addAccountDialog";
import Tooltip from "@mui/material/Tooltip";
import AddCircleIcon from "@mui/icons-material/AddCircle";

export function Dashboard() {
  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openAddAccountDialog, setOpenAddAccountDialog] = useState(false);

  async function fetchAccounts() {
    try {
      const response = await invoke("display_accounts");
      console.log(response);

      if (response.message) {
        setMessage(response.message);
        return;
      }

      setAccounts(response);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  }

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <main className="Dashboard">
      <Header />
      <h2>Dashboard</h2>
      <Box
        sx={{
          p: 2,
        }}
      >
        <div className="account-list">
          <Tooltip title="Eintrag hinzufügen">
            <AddCircleIcon
              fontSize="large"
              onClick={() => setOpenAddAccountDialog(true)}
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
                service_email={account.service_email}
                service_username={account.service_username}
                service_password={account.service_password}
                selected={selectedAccount === account.account_id}
                onSelect={setSelectedAccount}
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
      <Footer />
    </main>
  );
}

export default Dashboard;
