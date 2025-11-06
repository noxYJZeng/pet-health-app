import React, { useState, useRef } from "react";
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
  const chartRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [activeTab, setActiveTab] = useState("Week");

  const weekData = [112, 115, 118, 135, 122, 118, 120];

  const data = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Heart Rate",
        data: weekData,
        borderColor: "#FF6C84",
        tension: 0.4,
        pointBackgroundColor: "#FF6C84",
        pointRadius: 6,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      y: { min: 100, max: 150, ticks: { stepSize: 10 } },
      x: { grid: { display: false } },
    },
    onHover: (event) => {
      const chart = chartRef.current;
      if (!chart) return;

      const points = chart.getElementsAtEventForMode(
        event,
        "nearest",
        { intersect: true },
        false
      );

      if (points.length) {
        const index = points[0].index;
        const value = weekData[index];
        const x = chart.scales.x.getPixelForValue(index);
        const y = chart.scales.y.getPixelForValue(value);
        setTooltip({ x, y, value });
      } else {
        setTooltip(null);
      }
    },
  };

  return (
    <div className="page-wrapper">
      <div className="chart-container">
        <h2 className="title">Heart Rate</h2>

        <div className="tab-group">
          {["Day", "Week", "Month"].map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="date-tag">2025/10/1 - 2025/10/23</div>

        <div style={{ position: "relative" }}>
          <Line ref={chartRef} data={data} options={options} />

          {tooltip && (
            <div
              className="tooltip-card"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: "translate(-50%, -120%)",
              }}
            >
              ❤️ {tooltip.value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
