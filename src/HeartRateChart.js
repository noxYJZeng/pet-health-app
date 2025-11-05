import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

export default function HeartRateChart() {
  const [range, setRange] = useState("week");

  const data = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Heart Rate",
        data: [112, 115, 118, 135, 122, 118, 120],
        borderColor: "#FF6C84",
        tension: 0.4,
        fill: false,
        pointBackgroundColor: "#FF6C84",
        pointRadius: 5,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 100, max: 150, ticks: { stepSize: 10 } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="chart-container">
      <h2 className="title">Heart Rate</h2>

      <div className="range-buttons">
        {["day", "week", "month"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={range === r ? "active" : ""}
          >
            {r[0].toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <div className="date-tag">
        2025/10/1 - 2025/10/23
      </div>

      <Line data={data} options={options} />

      <div className="value-box">
        ❤️ Heart Rate: <span>118</span>
      </div>
    </div>
  );
}
