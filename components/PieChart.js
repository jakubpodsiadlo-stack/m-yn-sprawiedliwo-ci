import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// STAŁE KOLORY DZIAŁÓW
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
        count: 0,
        scores: [],
        dates: []
      };
    }
    grouped[a.department].count += 1;
    grouped[a.department].scores.push(a.score);
    grouped[a.department].dates.push(new Date(a.date));
  });

  const labels = Object.keys(grouped);
  const sizes = labels.map(l => grouped[l].count);
  const colors = labels.map(l => COLORS[l] || "#999");

  // dane do wykresu
  const data = {
    labels,
    datasets: [
      {
        data: sizes,
        backgroundColor: colors,
        borderColor: "#ffffff",
        borderWidth: 2
      }
    ]
  };

  return (
    <>
      <Pie data={data} />

      {/* SZCZEGÓŁY PER DZIAŁ */}
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                marginBottom: "8px",
                borderRadius: "10px",
                background: "#f5f5f5",
                borderLeft: `6px solid ${COLORS[dep] || "#999"}`
              }}
            >
              <strong>{dep}</strong>
              <span>Śr.: {avg.toFixed(2)}</span>
              <span>Ostatni: {lastDate}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
