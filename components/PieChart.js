import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = {
  Produkcja: "#1e3c72",
  HR: "#2e7d32",
  Finanse: "#f57c00",
  IT: "#6a1b9a",
  Logistyka: "#c62828"
};

export default function PieChart({ audits }) {
  const [selected, setSelected] = useState(null);

  const grouped = {};
  audits.forEach(a => {
    if (!grouped[a.department]) {
      grouped[a.department] = {
        scores: [],
        dates: []
      };
    }
    grouped[a.department].scores.push(a.score);
    grouped[a.department].dates.push(new Date(a.date));
  });

  const labels = Object.keys(grouped);
  const values = labels.map(l => grouped[l].scores.length);
  const colors = labels.map(l => COLORS[l] || "#999");

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 2,
        cutout: "65%" // <<< KLUCZ
      }
    ]
  };

  const options = {
    onClick: (_, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        setSelected(labels[index]);
      }
    },
    plugins: {
      legend: {
        position: "top"
      }
    }
  };

  let center = "Kliknij dział";
  if (selected) {
    const scores = grouped[selected].scores;
    const avg =
      scores.reduce((a, b) => a + b, 0) / scores.length;

    const lastDate = grouped[selected].dates
      .sort((a, b) => b - a)[0]
      .toISOString()
      .split("T")[0];

    center = `${selected}\nŚrednia: ${avg.toFixed(2)}\nOstatni: ${lastDate}`;
  }

  return (
    <div style={{ position: "relative" }}>
      <Doughnut data={data} options={options} />

      {/* ŚRODEK */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          fontWeight: "bold",
          whiteSpace: "pre-line",
          pointerEvents: "none"
        }}
      >
        {center}
      </div>
    </div>
  );
}
