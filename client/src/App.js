import React from "react";
import MainNav from "./pages/Navbar";
import GetBlocks from "./pages/GetBlocks";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import BlockTransactions from "./pages/BlockTransactions";
import TxInfo from "./pages/Transaction";

function LocationInfo() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const date = queryParams.get("date") || "";

  return <div>{date}</div>;
}

function App() {
  return (
    <Router>
      <div
        className="App bg-primary-subtle text-white"
        data-bs-theme="dark"
        style={{
          width: "100%",
          overflow: "auto",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MainNav expand={false} />

        <LocationInfo />

        <Routes>
          <Route path="/" element={<GetBlocks />} />
          <Route path="/block/:blockHeight" element={<BlockTransactions />} />
          <Route path="/tx/:txid" element={<TxInfo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
