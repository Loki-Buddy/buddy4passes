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
import NestedList from "../components/NestedList";

export function Dashboard() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAccountInfo, setSelectedAccountsInfo] = useState(null);
  const [openAddAccountDialog, setOpenAddAccountDialog] = useState(false);
  const [openDisplayAccountDialog, setOpenDisplayAccountDialog] = useState(false);
  const [groups, setGroups] = useState([]);
  const [filter, setFilter] = useState(null);
  const [displayAccounts, setDisplayAccounts] = useState([]);

  async function filterAccountsByGroup() {
    if (filter === null) {
      setDisplayAccounts(accounts);
    } else {
      const filtered = accounts.filter(
        (account) => account.group_id === filter
      );
      setDisplayAccounts(filtered);
    }
  }

  async function fetchAccounts() {
    try {
      const response = await invoke("display_accounts");

      if (response.message) {
        setMessage("Keine Einträge vorhanden");
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
  async function fetchGroups() {
    try {
      const response = await invoke("get_groups");

      if (response.success === false) {
        return;
      }
      const sortedGroups = response.groups.sort(
        (a, b) => a.group_id - b.group_id
      );
      setGroups(sortedGroups);

    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }


  useEffect(() => {
    fetchGroups();
    fetchAccounts();
  }, []);

  useEffect(() => {
    filterAccountsByGroup();
  }, [filter, accounts]);

  return (
    <main className="Dashboard">
      <Header />
      <Button
        onClick={() => navigate("/masteredit")}
        sx={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          zIndex: 1000,
        }}
      >
        <img
          src={benutzerIcon}
          className="logo"
          alt="dashboard"
          style={{
            width: "24px",
            height: "24px",
            marginRight: "8px",
            opacity: 0.6,
          }}
        />
        Profil
      </Button>
      <h2>Dashboard</h2>
      <div className="layout">
        <div className="sidebar">
          <div className="sidebar-scrollable">
            <NestedList
              groups={groups}
              onGroupAdded={() => fetchGroups()}
              onFilterChange={(groupId) => setFilter(groupId)}
              selectedGroup={filter}
            />
          </div>
        </div>
        <div className="content">

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
                  alignSelf: "center",
                }}
              />
            </Tooltip>

            {message ? (
              <p>{message}</p>
            ) : (
              displayAccounts.map((account) => (
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

        </div>
      </div>

      {/* Dialoge müssen außerhalb des Flex-Containers bleiben */}
      <AddAccountDialogSlide
        groups={groups}
        fetchGroups={fetchGroups}
        open={openAddAccountDialog}
        onClose={() => setOpenAddAccountDialog(false)}
        onSubmit={fetchAccounts}
      />

      <DisplayAccountDialogSlide
        groups={groups}
        fetchGroups={fetchGroups}
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
