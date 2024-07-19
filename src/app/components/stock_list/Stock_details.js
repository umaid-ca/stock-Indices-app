"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LineChart from "./LinkChart";

const Stock_details = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [indiceData, setIndicedata] = useState(undefined);
  const [selectedData, setSelectedData] = useState(null);
  const [percentagePorL, setPercentagePorL] = useState("0");
  const [pricePorL, setPricePorL] = useState("0");

  const color = percentagePorL > 0 ? "green" : "red";
  const textStyle = {
    color: color,
  };

  const profitCalculation = (openPrice, closePrice) => {
    let percentageChange = ((closePrice - openPrice) / openPrice) * 100;
    return percentageChange.toFixed(2);
  };

  const profitPriceCalculation = (openPrice, closePrice) => {
    let percentageChange = closePrice - openPrice;
    return percentageChange.toFixed(2);
  };

  async function getData() {
    const url = `https://api.polygon.io/v2/aggs/ticker/I:${selectedData.symbol}/prev?apiKey=3N1dIVStpI_dSwIpJJZqN6mgneHj4O0p`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const respData = await response.json();
      let claculation = profitCalculation(
        respData.results[0].o,
        respData.results[0].c
      );
      let claculationPrice = profitPriceCalculation(
        respData.results[0].o,
        respData.results[0].c
      );
      setPercentagePorL(claculation);
      setPricePorL(claculationPrice);
      setIndicedata(respData.results[0]);
      return respData.results;
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    setSelectedData(JSON.parse(localStorage.getItem("Indice")));
  }, []);

  useEffect(() => {
    if (selectedData) {
      getData();
    }
  }, [selectedData]);

  if (status == "loading") {
    return <h1>Loading...</h1>;
  } else if (status == "authenticated") {
    return (
      <div style={{ padding: "0px 20px" }}>
        <button onClick={() => router.push("/")} className="back_btn">
          {"< Back"}
        </button>
        <h1>
          Stock Indice: {selectedData ? selectedData.name : "Now Selected Data"}
        </h1>
        <h2>You may be interested in: </h2>
        <div className="stock_data">
          <span>
            {selectedData?.symbol}
            <span style={{ marginLeft: "30px" }}>{selectedData?.name}</span>
          </span>
          <span>${indiceData?.c?.toFixed(2)}</span>
          <span style={textStyle}>{percentagePorL}%</span>
          <span style={textStyle}>${pricePorL}</span>
        </div>
        {indiceData != undefined && (
          <div>
            <LineChart />
          </div>
        )}
        {indiceData == undefined && (
          <div>
            <h1>No Record Found</h1>
          </div>
        )}
      </div>
    );
  } else if (status == "unauthenticated") {
    return router.push("/login");
  }
};

export default Stock_details;
