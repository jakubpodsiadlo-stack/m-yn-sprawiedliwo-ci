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

// ===== TEKST PO ŁUKU =====
const drawTextAlongArc = (ctx, text, x, y, radius, angle) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  const chars = text.split("");
  const spacing = 0.12; // im mniejsze tym ciaśniej

  ctx.rotate(-((chars.length - 1) * spacing) / 2);

  chars.forEach(char => {
    ctx.save();
    ctx.translate(0, -radius);
    ctx.fillText(char, 0, 0);
    ctx.restore();
    ctx.rotate(spacing);
  });

  ctx.restore();
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
        : "brak daty",
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
        borderWidth: 2,
        hoverOffset: 12
      }
    ]
  };

  const segmentTextPlugin = {
    id: "segmentText",
    afterDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);

      ctx.save();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      meta.data.forEach((arc, i) => {
        const angle = (arc.startAngle + arc.endAngle) / 2;
        const centerX = arc.x;
        const centerY = arc.y;

        // ===== NAZWA DZIAŁU PO ŁUKU =====
        ctx.font = "bold 14px sans-serif";
        drawTextAlongArc(
          ctx,
          metrics[i].name,
          centerX,
          centerY,
          arc.outerRadius * 0.95,
          angle
        );

        // ===== INFO POD ŁUKIEM =====
        const infoRadius = arc.outerRadius * 0.65;
        const x = centerX + Math.cos(angle) * infoRadius;
        const y = centerY + Math.sin(angle) * infoRadius;

        ctx.font = "bold 12px sans-serif";
        ctx.fillText(`Audytów: ${metrics[i].count}`, x, y - 10);

        ctx.font = "12px sans-serif";
        ctx.fillText(metrics[i].lastDate, x, y + 10);
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
