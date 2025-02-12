import React, { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend
);

function TxInfo() {
  const { txid } = useParams();
  const [txData, setTxData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Greška

  // Dohvat podataka o bloku
  const fetchTxData = (page = 1) => {
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:8080/blockchain/tx/${txid}`)
      .then((response) => {
        setTxData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Dogodila se greška prilikom dohvaćanja transakcije.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTxData();
  }, [txid]);

  return (
    <div className="m-4">
      <h2>Transakcija {txid}</h2>
      {/* 
      {/* Prikaz učitavanja */}
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100%",
          }}
        >
          <ClipLoader
            color={"#ffffff"}
            loading={loading}
            size={80}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}

      {/* Prikaz pogreške */}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {/* Prikaz podataka o bloku i transakcijama */}
      {txData && (
        <div
          style={{
            backgroundColor: "#2f4f4f",
            color: "white",
            padding: "20px",
          }}
        >
          <h3>Transaction details</h3>
          <p>
            <strong>Txid:</strong> {txData.txid}
          </p>
          <p>
            <strong>Sent:</strong> {txData.valIn} LTC
          </p>
          <p>
            <strong>Recevied:</strong> {txData.valOut} LTC
          </p>
          <p>
            <strong>Fee:</strong> {txData.fee} LTC
          </p>
          <p>
            <strong>Txs of entry:</strong>
            {txData.valInHashes.map((hash, index) => (
              <div key={index}>{hash}</div>
            ))}
          </p>
          <p>
            <strong>Types of ScriptPubKey:</strong>
            {txData.valOutTypes.map((hash, index) => (
              <div key={index}>{hash}</div>
            ))}
          </p>
          <p>
            <strong>Block height:</strong> {txData.blockHeight}
          </p>
        </div>
      )}
    </div>
  );
}

export default TxInfo;
