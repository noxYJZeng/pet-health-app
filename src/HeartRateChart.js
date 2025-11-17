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
  const containerRef = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [activeTab, setActiveTab] = useState("Day");

  // ------------------------------
  // DATA
  // ------------------------------

  const labelsDay = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const dataDay = [
    98, 96, 94, 93, 95, 100, 108, 115, 122, 128, 132, 130,
    127, 125, 123, 121, 118, 120, 124, 130, 128, 118, 110, 102
  ];

  const labelsWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dataWeek = [112, 115, 118, 135, 122, 118, 120];

  const labelsMonth = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
  const dataMonthRef = useRef(
    Array.from({ length: 30 }, () => 110 + Math.floor(Math.random() * 25))
  );

  let labels, values;

  if (activeTab === "Day") {
    labels = labelsDay;
    values = dataDay;
  } else if (activeTab === "Week") {
    labels = labelsWeek;
    values = dataWeek;
  } else {
    labels = labelsMonth;
    values = dataMonthRef.current;
  }

  // ------------------------------
  // CHART CONFIG
  // ------------------------------

  const data = {
    labels,
    datasets: [
      {
        label: "Heart Rate",
        data: values,
        borderColor: "#FF6C84",
        tension: 0.4,
        pointBackgroundColor: "#FF6C84",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    animation: false,
    hover: { animation: false },

    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },

    scales: {
      y: { min: 80, max: 160, ticks: { stepSize: 10 } },
      x: { grid: { display: false } },
    },

    onHover: (event) => {
      const chart = chartRef.current;
      if (!chart) return;

      const { offsetX } = event.native;

      const xScale = chart.scales.x;
      const yScale = chart.scales.y;

      // ------------------------------
      // WEEK / MONTH → 原逻辑; 不能动
      // ------------------------------
      if (activeTab !== "Day") {
        const points = chart.getElementsAtEventForMode(
          event,
          "nearest",
          { intersect: false },
          false
        );

        if (!points.length) {
          setTooltip(null);
          return;
        }

        const index = points[0].index;
        const v = values[index];
        const label = labels[index];

        const px = xScale.getPixelForValue(index);
        const py = yScale.getPixelForValue(v);

        setTooltip({ x: px, y: py, value: v, label });
        return;
      }

      // ------------------------------
      // DAY → 自由 hover （关键修复）
      // ------------------------------
      const chartLeft = xScale.left;
      const chartRight = xScale.right;

      if (offsetX < chartLeft || offsetX > chartRight) {
        setTooltip(null);
        return;
      }

      // 将像素映射到 0 - 23 的小时数
      const hourFloat =
        ((offsetX - chartLeft) / (chartRight - chartLeft)) * 23;

      const h = Math.floor(hourFloat);
      const t = hourFloat - h; // 小数（0-1）

      // 对心率做简单线性插值
      const v1 = values[h];
      const v2 = values[Math.min(h + 1, 23)];
      const v = Math.round(v1 * (1 - t) + v2 * t);

      // 时间格式 HH:MM
      const mm = Math.round(t * 60)
        .toString()
        .padStart(2, "0");
      const label = `${h}:${mm}`;

      const px = offsetX;
      const py = yScale.getPixelForValue(v);

      setTooltip({ x: px, y: py, value: v, label });
    },
  };

  // 鼠标离开 chart 时隐藏 tooltip
  const handleLeave = () => setTooltip(null);

  return (
    <div className="page-wrapper">
      <div className="chart-container">

        <h2>Heart Rate</h2>

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

        <div className="date-tag">
          {activeTab === "Day"
            ? "2025/10/23"
            : activeTab === "Week"
            ? "2025/10/17 - 2025/10/23"
            : "October"}
        </div>

        <div
          ref={containerRef}
          style={{ position: "relative" }}
          onMouseLeave={handleLeave}
        >
          <Line ref={chartRef} data={data} options={options} />

          {tooltip && (
            <div
              className="tooltip-card"
              style={{
                position: "absolute",
                left: tooltip.x,
                top: tooltip.y,
                transform: "translate(-50%, -120%)",
                padding: "6px 10px",
                backgroundColor: "#ff6c84",
                color: "white",
                borderRadius: "6px",
                fontSize: "13px",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              {tooltip.label} ❤️ {tooltip.value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
