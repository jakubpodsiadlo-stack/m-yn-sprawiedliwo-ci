import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = {
  Produkcja: "#1e3c72",
  HR: "#2e7d32",
  Finanse: "#f57c00",
  IT: "#6a1b9a",
  Logistyka: "#c62828"
};

export default function PieChart({ audits }) {
  // ===== GRUPOWANIE =====
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

  const metrics = labels.map(dep => {
    const scores = grouped[dep].scores;
    const avg =
      scores.reduce((a, b) => a + b, 0) / scores.length;

    const lastDate = grouped[dep].dates
      .sort((a, b) => b - a)[0]
      .toISOString()
      .split("T")[0];

    return {
      name: dep,
      avg: avg.toFixed(1),
      date: lastDate
    };
  });

  // ===== WYKRES =====
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 12 // <<< „wyskakiwanie” segmentu
      }
    ]
  };

  // ===== PLUGIN TEKSTU =====
  const segmentTextPlugin = {
    id: "segmentText",
    afterDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const active =
        chart.tooltip?.dataPoints?.[0]?.dataIndex;

      ctx.save();
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

        const isActive = i === active;

        ctx.fillStyle = "#fff";
        ctx.font = isActive
          ? "bold 14px sans-serif"
          : "bold 10px sans-serif";

        ctx.fillText(metrics[i].name, x, y - 12);
        ctx.fillText(`Śr: ${metrics[i].avg}`, x, y);
        ctx.fillText(metrics[i].date, x, y + 12);
      });

      ctx.restore();
    }
  };

  const options = {
    cutout: "60%",
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true }
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
