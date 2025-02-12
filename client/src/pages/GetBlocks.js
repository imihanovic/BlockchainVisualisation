import React, { useState } from "react";
import { Accordion, Table } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { RiInfoCardFill } from "react-icons/ri";
import ClipLoader from "react-spinners/ClipLoader";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  PointElement,
} from "chart.js";
import useGetBlocks from "../hooks/useGetBlocks";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  PointElement
);

function TransactionsPerBlock() {
  const [selectedDate, setSelectedDate] = useState("");
  const { blocks, loading } = useGetBlocks(selectedDate);
  const [activeKey, setActiveKey] = useState("0");
  const navigate = useNavigate();

  const handleAccordionToggle = (index) => {
    setActiveKey(index.toString() === activeKey ? undefined : index.toString());
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    navigate(`?date=${event.target.value}`);
  };

  const prepareChartData = () => {
    if (!Array.isArray(blocks)) {
      console.error("blocks is not an array:", blocks);
      return {};
    }

    const blockHeights = blocks.map((block) => block.blockHeight);
    const txCounts = blocks.map((block) => block.txCount);
    const confirmations = blocks.map((block) => block.blockConfirmations);

    return {
      labels: blockHeights,
      datasets: [
        {
          label: "Number of Transactions per Block",
          data: txCounts,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          yAxisID: "y1",
        },
        {
          label: "Number of Confirmations per Block",
          data: confirmations,
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
          yAxisID: "y2",
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Block Height",
          color: "red",
        },
        ticks: {
          color: "white",
        },
      },
      y1: {
        title: {
          display: true,
          text: "Number of Transactions",
          color: "red",
        },
        ticks: {
          color: "white",
        },
        position: "left",
      },
      y2: {
        title: {
          display: true,
          text: "Number of Confirmations",
          color: "red",
        },
        ticks: {
          color: "white",
        },
        position: "right",
        grid: {
          drawOnChartArea: false, // ne želimo grid linije na desnoj y-osi
        },
      },
    },
  };

  if (loading) {
    return (
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
    );
  } else {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          padding: "20px",
          gap: "20px",
        }}
      >
        {/* filter za datum */}
        <div
          style={{
            padding: "10px",
            backgroundColor: "#2f4f4f",
            borderRadius: "8px",
            color: "white",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            width: "150px",
          }}
        >
          <h5 style={{ marginBottom: "10px", fontSize: "1rem" }}>
            Filter by Date
          </h5>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min="2009-12-12"
            max={new Date().toISOString().split("T")[0]}
            style={{
              padding: "8px",
              fontSize: "0.9rem",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          {/* Graf */}
          <div
            style={{
              maxWidth: "1200px",
              height: "auto",
              width: "auto",
              marginBottom: "20px",
            }}
          >
            <Line data={prepareChartData()} options={chartOptions} />
          </div>

          {/* Popis blokova ispod grafa */}
          <Accordion activeKey={activeKey}>
            {blocks
              .slice()
              .reverse()
              .map((block, index) => (
                <Accordion.Item
                  eventKey={index.toString()}
                  key={block.blockHeight}
                >
                  <Accordion.Header
                    onClick={() => handleAccordionToggle(index)}
                  >
                    Block {block.blockHeight}
                  </Accordion.Header>
                  <Accordion.Body
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
                              Block Height
                            </th>
                            <th
                              style={{
                                backgroundColor: "#000000",
                                color: "white",
                              }}
                            >
                              Block Hash
                            </th>
                            <th
                              style={{
                                backgroundColor: "#000000",
                                color: "white",
                              }}
                            >
                              Transactions Count
                            </th>
                            <th
                              style={{
                                backgroundColor: "#000000",
                                color: "white",
                              }}
                            >
                              Number of confirmations
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
                              {block.blockHeight}
                            </td>
                            <td
                              style={{
                                backgroundColor: "#2f4f4f",
                                color: "white",
                              }}
                            >
                              {block.blockHash}
                            </td>
                            <td
                              style={{
                                backgroundColor: "#2f4f4f",
                                color: "white",
                              }}
                            >
                              {block.txCount}
                            </td>
                            <td
                              style={{
                                backgroundColor: "#2f4f4f",
                                color: "white",
                              }}
                            >
                              {block.blockConfirmations}
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                backgroundColor: "#2f4f4f",
                                color: "white",
                              }}
                            >
                              <Link to={`/block/${block.blockHeight}`}>
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
                  </Accordion.Body>
                </Accordion.Item>
              ))}
          </Accordion>
        </div>
      </div>
    );
  }
}

export default TransactionsPerBlock;
