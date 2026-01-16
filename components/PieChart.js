import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// KOLORY DZIAŁÓW
const COLORS = {
  Produkcja: "#1e3c72",
  HR: "#2e7d32",
  Finanse: "#f57c00",
  IT: "#6a1b9a",
  Logistyka: "#c62828"
};

export default function PieChart({ audits }) {
  // === GRUPOWANIE DANYCH ===
  const grouped = {};
  audits.forEach(a => {
    if (!grouped[a.department]) {
      grouped[a.department] = { scores: [], dates: [] };
    }
    grouped[a.department].scores.push(a.score);
    grouped[a.department].dates.push(new Date(a.date));
  });

  const labels = Object.keys(grouped);
  const values = labels.map(l => grouped[l].scores.length);
  const colors = labels.map(l => COLORS[l] || "#999");

  // === METRYKI PER DZIAŁ ===
  const metrics = labels.map(dep => {
    const scores = grouped[dep].scores;
    const avg =
      scores.reduce((a, b) => a + b, 0) / scores.length;

    const lastDate = grouped[dep].dates
      .sort((a, b) => b - a)[0]
      .toISOString()
      .split("T")[0];

    return {
      avg: avg.toFixed(1),
      date: lastDate
    };
  });

  // === WYKRES ===
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: "#fff",
        borderWidth: 2
      }
    ]
  };

  // === PLUGIN RYSUJĄCY TEKST NA SEGMENTACH ===
  const segmentTextPlugin = {
    id: "segmentText",
    afterDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);

      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      meta.data.forEach((arc, i) => {
        const angle =
          (arc.startAngle + arc.endAngle) / 2;

        const radius =
          (arc.outerRadius + arc.innerRadius) / 2;

        const x =
          arc.x + Math.cos(angle) * radius;
        const y =
          arc.y + Math.sin(angle) * radius;

        ctx.fillText(`Śr: ${metrics[i].avg}`, x, y - 7);
        ctx.fillText(metrics[i].date, x, y + 7);
      });

      ctx.restore();
    }
  };

  const options = {
    cutout: "60%",
    plugins: {
      legend: { position: "bottom" }
    }
  };

  return (
    <Doughnut
      data={data}
      options={options}
      plugins={[segmentTextPlugin]}
    />
  );
}

