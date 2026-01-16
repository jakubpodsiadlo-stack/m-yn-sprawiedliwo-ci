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
  // grupowanie danych per dział
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
        borderColor: "#ffffff",
        borderWidth: 2
      }
    ]
  };

  const options = {
    cutout: "65%",
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <>
      {/* WYKRES */}
      <Doughnut data={data} options={options} />

      {/* KAFELKI PER DZIAŁ */}
      <div style={{ marginTop: "25px" }}>
        {labels.map(dep => {
          const scores = grouped[dep].scores;
          const avg =
            scores.reduce((a, b) => a + b, 0) / scores.length;

          const lastDate = grouped[dep].dates
            .sort((a, b) => b - a)[0]
            .toISOString()
            .split("T")[0];

          return (
            <div
              key={dep}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: "15px",
                alignItems: "center",
                padding: "12px 16px",
                marginBottom: "10px",
                borderRadius: "12px",
                background: "#f5f5f5",
                borderLeft: `6px solid ${COLORS[dep]}`
              }}
            >
              <strong>{dep}</strong>
              <span>Śr.: {avg.toFixed(2)}</span>
              <span>{lastDate}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
