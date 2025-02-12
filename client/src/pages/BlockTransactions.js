import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { FaCopy } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  Table,
  Pagination,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionBody,
} from "react-bootstrap";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { RiInfoCardFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LogarithmicScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registracija potrebnih komponenti za Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function BlockTransactions() {
  const { blockHeight } = useParams();
  const [blockData, setBlockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeKey, setActiveKey] = useState("0");

  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopySuccess(true);
        toast.success("TxID kopiran!");
      })
      .catch(() => {
        setCopySuccess(false);
        toast.error("Pogreška prilikom kopiranja!");
      });
  };

  const handleAccordionToggle = (index) => {
    setActiveKey(index.toString() === activeKey ? undefined : index.toString());
  };

  const fetchBlockData = (page = 1) => {
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:8080/blockchain/block/${blockHeight}`, {
        params: { page, limit: 20 },
      })
      .then((response) => {
        setBlockData(response.data);
        setTotalPages(response.data.totalPages);
        setCurrentPage(page);
        setLoading(false);
      })
      .catch((error) => {
        setError("Dogodila se greška prilikom dohvaćanja bloka.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBlockData();
  }, [blockHeight]);

  const prepareTransactionFeeData = () => {
    if (!blockData || !Array.isArray(blockData.transactions)) {
      return {};
    }

    const txHash = blockData.transactions
      .filter((tx) => tx.valIn !== 0)
      .map((transaction) => transaction.txid);

    const shortHash = txHash.map((tx) => tx.slice(0, 5));
    const txFee = blockData.transactions
      .filter((tx) => tx.valIn !== 0)
      .map((transaction) => transaction.fee);

    return {
      labels: shortHash,
      datasets: [
        {
          label: "Transaction Fee",
          data: txFee,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareValueInValueOutData = () => {
    if (!blockData || !Array.isArray(blockData.transactions)) {
      return {};
    }

    const txHash = blockData.transactions
      .filter((tx) => tx.valIn !== 0 || tx.valOut !== 0)
      .map((transaction) => transaction.txid);

    const shortHash = txHash.map((tx) => tx.slice(0, 5));
    const valIn = blockData.transactions
      .filter((tx) => tx.valIn !== 0)
      .map((transaction) => transaction.valIn);

    const valOut = blockData.transactions
      .filter((tx) => tx.valOut !== 0)
      .map((transaction) => transaction.valOut);

    const minValue = Math.min(...valIn.concat(valOut));

    return {
      labels: shortHash,
      datasets: [
        {
          label: "Value In",
          data: valIn,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Value Out",
          data: valOut,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="m-4">
      <h2>Transakcije bloka {blockHeight}</h2>

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
      {blockData && (
        <div>
          {/* Bar graf za Transaction Fee */}
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "80%", maxWidth: "1000px" }}>
              <Bar
                data={prepareTransactionFeeData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      labels: {
                        color: "white",
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const fee = context.raw;
                          return `${context.dataset.label}: ${fee} LTC`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: "white",
                      },
                    },
                    y: {
                      ticks: {
                        color: "white",
                      },
                      min: 0,
                    },
                  },
                }}
                style={{
                  height: "400px", // Visina grafika za fee
                  width: "100%",
                }}
              />
            </div>
          </div>

          {/* Bar graf za Value In i Value Out (Logarithmic scale) */}
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div style={{ width: "100%", maxWidth: "1000px" }}>
              <Bar
                data={prepareValueInValueOutData()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      labels: {
                        color: "white",
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const value = context.raw;
                          return `${context.dataset.label}: ${value} LTC`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: "white",
                      },
                    },
                    y: {
                      ticks: {
                        color: "white",
                      },
                      min:
                        Math.min(
                          ...blockData.transactions
                            .map((tx) => tx.valIn)
                            .concat(
                              blockData.transactions.map((tx) => tx.valOut)
                            )
                        ) || 1, // Postavljamo min na najmanju vrijednost
                      type: "logarithmic", // Postavljanje logarithmic skale
                    },
                  },
                }}
                style={{
                  height: "400px", // Visina grafika za value in/out
                  width: "100%",
                }}
              />
            </div>
          </div>

          <Accordion activeKey={activeKey}>
            <h4>Transakcije</h4>
            {blockData.transactions
              .filter((tx) => tx.valIn !== 0)
              .map((tx, index) => (
                <AccordionItem
                  eventKey={index.toString()}
                  key={tx.txid}
                  style={{
                    backgroundColor: "#2f4f4f",
                    color: "white",
                  }}
                >
                  <AccordionHeader
                    onClick={() => handleAccordionToggle(index)}
                    style={{
                      backgroundColor: "#2f4f4f",
                      color: "white",
                    }}
                  >
                    Transaction {tx.txid}
                  </AccordionHeader>
                  <AccordionBody
                    style={{
                      backgroundColor: "black",
                      color: "white",
                    }}
                  >
                    <div style={{ fontSize: "1rem", lineHeight: "1.8" }}>
                      <Table
                        hover
                        responsive
                        style={{ backgroundColor: "black", color: "white" }}
                      >
                        <thead
                          style={{ backgroundColor: "black", color: "white" }}
                        >
                          <tr>
                            <th
                              style={{
                                backgroundColor: "#000000",
                                color: "white",
                              }}
                            >
                              Transaction ID
                            </th>
                            <th
                              style={{
                                backgroundColor: "#000000",
                                color: "white",
                              }}
                            >
                              Value in
                            </th>
                            <th
                              style={{
                                backgroundColor: "#000000",
                                color: "white",
                              }}
                            >
                              Value out
                            </th>
                            <th
                              style={{
                                backgroundColor: "#000000",
                                color: "white",
                              }}
                            >
                              Fee
                            </th>
                            <th
                              style={{
                                backgroundColor: "#000000",
                                color: "white",
                              }}
                            >
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td
                              style={{
                                backgroundColor: "#2f4f4f",
                                color: "white",
                              }}
                            >
                              {tx.txid}
                              <FaCopy
                                style={{
                                  cursor: "pointer",
                                  marginLeft: "10px",
                                }}
                                onClick={() => copyToClipboard(tx.txid)}
                              />
                              {copySuccess !== null && (
                                <p
                                  style={{
                                    color: "white",
                                    fontSize: "12px",
                                    marginTop: "5px",
                                  }}
                                >
                                  {copySuccess
                                    ? "TxID je uspješno kopiran!"
                                    : ""}
                                </p>
                              )}
                            </td>
                            <td
                              style={{
                                backgroundColor: "#2f4f4f",
                                color: "white",
                              }}
                            >
                              {tx.valIn} LTC
                            </td>
                            <td
                              style={{
                                backgroundColor: "#2f4f4f",
                                color: "white",
                              }}
                            >
                              {tx.valOut} LTC
                            </td>
                            <td
                              style={{
                                backgroundColor: "#2f4f4f",
                                color: "white",
                              }}
                            >
                              {tx.fee} LTC
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                backgroundColor: "#2f4f4f",
                                color: "white",
                              }}
                            >
                              <Link to={`/tx/${tx.txid}`}>
                                <RiInfoCardFill
                                  style={{
                                    fontSize: "24px",
                                    display: "block",
                                    margin: "0 auto",
                                  }}
                                />
                              </Link>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </AccordionBody>
                </AccordionItem>
              ))}
          </Accordion>

          {/* Paginacija */}
          <Pagination>
            <Pagination.Prev
              onClick={() => fetchBlockData(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => fetchBlockData(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => fetchBlockData(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
}

export default BlockTransactions;
