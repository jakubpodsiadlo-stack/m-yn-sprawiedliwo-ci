import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// ===== KOLOR WG ŚREDNIEJ =====
const getColorByAvg = (avg) => {
  if (avg <= 1) return "#1b5e20";
  if (avg <= 2) return "#66bb6a";
  if (avg <= 3) return "#fbc02d";
  if (avg <= 4) return "#ef5350";
  return "#b71c1c";
};

export default function PieChart({ audits }) {
  const grouped = {};

  audits.forEach(a => {
    if (!grouped[a.department]) {
      grouped[a.department] = {
        count: 0,
        dates: [],
        scores: []
      };
    }

    grouped[a.department].count += 1;
    if (a.date) grouped[a.department].dates.push(new Date(a.date));
    if (typeof a.score === "number" && !isNaN(a.score))
      grouped[a.department].scores.push(a.score);
  });

  const labels = Object.keys(grouped);

  const metrics = labels.map(dep => {
    const dates = grouped[dep].dates.sort((a, b) => b - a);
    const scores = grouped[dep].scores;

    const avg =
      scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 5;

    return {
      name: dep,
      count: grouped[dep].count,
      lastDate: dates.length
        ? dates[0].toISOString().split("T")[0]
        : "",
      color: getColorByAvg(avg)
    };
  });

  const data = {
    labels,
    datasets: [
      {
        data: metrics.map(m => m.count),
        backgroundColor: metrics.map(m => m.color),
        borderColor: "#fff",
        borderWidth: 2
      }
    ]
  };

  // ===== NAPRZEMIENNE TEKSTY =====
  const textPlugin = {
    id: "alternatingText",
    afterDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);

      ctx.save();
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      meta.data.forEach((arc, i) => {
        const angleSize = arc.endAngle - arc.startAngle;
        const angle = (arc.startAngle + arc.endAngle) / 2;

        // ❌ za mały segment – nie rysujemy
        if (angleSize < 0.12) return;

        // 🔀 CO DRUGI SEGMENT – INNY PROMIEŃ
        const radiusFactor = i % 2 === 0 ? 0.85 : 0.70;
        const r = arc.outerRadius * radiusFactor;

        const x = arc.x + Math.cos(angle) * r;
        const y = arc.y + Math.sin(angle) * r;

        // 🟡 średni segment – tylko nazwa
        if (angleSize < 0.22) {
          ctx.font = "bold 10px sans-serif";
          ctx.fillText(metrics[i].name, x, y);
          return;
        }

        // 🟢 większy segment – pełne info
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(metrics[i].name, x, y - 12);

        ctx.font = "10px sans-serif";
        ctx.fillText(`Audytów: ${metrics[i].count}`, x, y);

        ctx.font = "9.5px sans-serif";
        ctx.fillText(metrics[i].lastDate, x, y + 12);
      });

      ctx.restore();
    }
  };

  const options = {
    cutout: 0,
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    layout: { padding: 0 },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => {
            const m = metrics[ctx.dataIndex];
            return [
              m.name,
              `Audytów: ${m.count}`,
              `Ostatni: ${m.lastDate}`
            ];
          }
        }
      }
    }
  };

  return (
    <Doughnut
      data={data}
      options={options}
      plugins={[textPlugin]}
    />
  );
}
