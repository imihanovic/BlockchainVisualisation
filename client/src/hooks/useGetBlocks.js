import { useState, useEffect } from "react";

const useGetBlocks = (selectedDate = "") => {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 10 sekundi timeout

    const url = selectedDate
      ? `http://localhost:8080/blockchain/getBlocks?date=${selectedDate}`
      : `http://localhost:8080/blockchain/getBlocks?count=100`;

    fetch(url, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        setBlocks(data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          console.error("Request timed out");
        } else {
          console.error("Error fetching blocks:", error);
        }
        setLoading(false);
      })
      .finally(() => clearTimeout(timeoutId));
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);
  return { blocks, loading, fetchData };
};

export default useGetBlocks;
