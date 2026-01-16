import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// ===== KOLOR NA PODSTAWIE ŚREDNIEJ OCENY =====
const getColorByAvg = (avg) => {
  if (avg <= 1) return "#1b5e20";   // mocno zielony
  if (avg <= 2) return "#66bb6a";   // jasnozielony
  if (avg <= 3) return "#fbc02d";   // złoty
  if (avg <= 4) return "#ef5350";   // jasnoczerwony
  return "#b71c1c";                 // czerwony
};

export default function PieChart({ audits }) {
  const grouped = {};

  // ===== GRUPOWANIE DANYCH =====
  audits.forEach(a => {
    if (!grouped[a.department]) {
      grouped[a.department] = {
        count: 0,
        dates: [],
        scores: []
      };
    }

    grouped[a.department].count += 1;

    if (a.date) {
      grouped[a.department].dates.push(new Date(a.date));
    }

    // 🔒 ZABEZPIECZENIE: tylko poprawne liczby
    if (typeof a.score === "number" && !isNaN(a.score)) {
      grouped[a.department].scores.push(a.score);
    }
  });

  const labels = Object.keys(grouped);

  // ===== METRYKI =====
  const metrics = labels.map(dep => {
    const dates = grouped[dep].dates.sort((a, b) => b - a);
    const scores = grouped[dep].scores;

    const avg =
      scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 5; // 🚨 brak danych = czerwony alarm

    return {
      name: dep,
      count: grouped[dep].count,
      lastDate: dates.length > 0
        ? dates[0].toISOString().split("T")[0]
        : "brak daty",
      avg,
      color: getColorByAvg(avg)
    };
  });

  // ===== DANE WYKRESU =====
  const data = {
    labels,
    datasets: [
      {
        data: metrics.map(m => m.count),
        backgroundColor: metrics.map(m => m.color),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 20
      }
    ]
  };

  // ===== TEKST NA SEGMENTACH =====
  const segmentTextPlugin = {
    id: "segmentText",
    afterDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      meta.data.forEach((arc, i) => {
        const angle =
          (arc.startAngle + arc.endAngle) / 2;

        const radius = arc.outerRadius * 0.75;

        const x = arc.x + Math.cos(angle) * radius;
        const y = arc.y + Math.sin(angle) * radius;

        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 16px sans-serif";
        ctx.fillText(metrics[i].name, x, y - 20);

        ctx.font = "bold 13px sans-serif";
        ctx.fillText(`Audytów: ${metrics[i].count}`, x, y);

        ctx.font = "13px sans-serif";
        ctx.fillText(metrics[i].lastDate, x, y + 20);
      });

      ctx.restore();
    }
  };

  // ===== OPCJE =====
  const options = {
    cutout: 0, // pełne koło
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // stabilność
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true
      }
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
