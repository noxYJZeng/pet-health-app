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

  const [dayIndex, setDayIndex] = useState(0);

  const dayDates = [
    "2025/10/21",
    "2025/10/22",
    "2025/10/23",
  ];

  const daySeries = [
    [
      96, 94, 93, 95, 97, 102, 110, 118, 123, 129, 131, 128,
      126, 124, 121, 120, 119, 121, 125, 131, 129, 119, 111, 103
    ],
    [
      97, 95, 94, 93, 96, 103, 111, 117, 124, 130, 133, 129,
      128, 126, 122, 119, 118, 119, 123, 128, 127, 118, 109, 101
    ],
    [
      98, 96, 94, 93, 95, 100, 108, 115, 122, 128, 132, 130,
      127, 125, 123, 121, 118, 120, 124, 130, 128, 118, 110, 102
    ]
  ];

  const labelsDay = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const dataDay = daySeries[dayIndex];

  // -----------------------------------
  // WEEK
  // -----------------------------------

  const labelsWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dataWeek = [112, 115, 118, 135, 122, 118, 120];

  // -----------------------------------
  // MONTH (fixed, stable)
  // -----------------------------------
  const labelsMonth = Array.from({ length: 30 }, (_, i) => `${i + 1}`);

  const dataMonthRef = useRef(
    Array.from({ length: 30 }, () => 110 + Math.floor(Math.random() * 25))
  );

  // ------------------------------------------------
  // Select active dataset
  // ------------------------------------------------
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

  // ------------------------------------------------
  // Chart data format
  // ------------------------------------------------

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
      // DAY — free hover (HH:MM interpolation)
      // ------------------------------
      const chartLeft = xScale.left;
      const chartRight = xScale.right;

      if (offsetX < chartLeft || offsetX > chartRight) {
        setTooltip(null);
        return;
      }

      const hourFloat =
        ((offsetX - chartLeft) / (chartRight - chartLeft)) * 23;

      const h = Math.floor(hourFloat);
      const t = hourFloat - h;

      const v1 = values[h];
      const v2 = values[Math.min(h + 1, 23)];

      const v = Math.round(v1 * (1 - t) + v2 * t);

      const mm = Math.round(t * 60)
        .toString()
        .padStart(2, "0");
      const label = `${h}:${mm}`;

      const px = offsetX;
      const py = yScale.getPixelForValue(v);

      setTooltip({ x: px, y: py, value: v, label });
    },
  };

  const handleLeave = () => setTooltip(null);

  const goPrev = () => {
    setDayIndex((prev) => Math.max(0, prev - 1));
  };

  const goNext = () => {
    setDayIndex((prev) => Math.min(daySeries.length - 1, prev + 1));
  };

  return (
    <div className="page-wrapper">
      <div className="chart-container">

        <h2>Heart Rate</h2>

        {/* tabs */}
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

        {/* date bar & navigation */}
        {activeTab === "Day" ? (
          <div
            className="date-tag"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              onClick={goPrev}
              disabled={dayIndex === 0}
              style={{
                padding: "4px 10px",
                background: "#ffeff3",
                borderRadius: "6px",
                border: "1px solid #ffc0d0",
                cursor: dayIndex === 0 ? "default" : "pointer",
              }}
            >
              ←
            </button>

            <div style={{ fontWeight: 500 }}>{dayDates[dayIndex]}</div>

            <button
              onClick={goNext}
              disabled={dayIndex === daySeries.length - 1}
              style={{
                padding: "4px 10px",
                background: "#ffeff3",
                borderRadius: "6px",
                border: "1px solid #ffc0d0",
                cursor:
                  dayIndex === daySeries.length - 1 ? "default" : "pointer",
              }}
            >
              →
            </button>
          </div>
        ) : (
          <div className="date-tag">
            {activeTab === "Week"
              ? "2025/10/17 - 2025/10/23"
              : "October"}
          </div>
        )}

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
