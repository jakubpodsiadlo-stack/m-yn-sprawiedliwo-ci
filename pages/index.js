import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// ===== KOLOR NA PODSTAWIE ŚREDNIEJ =====
const getColorByAvg = (avg) => {
  if (avg <= 1) return "#1b5e20";      // mocno zielony
  if (avg <= 2) return "#66bb6a";      // jasnozielony
  if (avg <= 3) return "#fbc02d";      // złoty
  if (avg <= 4) return "#ef5350";      // jasnoczerwony
  return "#b71c1c";                    // czerwony
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
    grouped[a.department].dates.push(new Date(a.date));
    grouped[a.department].scores.push(a.score);
  });

  const labels = Object.keys(grouped);

  const metrics = labels.map(dep => {
    const dates = grouped[dep].dates.sort((a, b) => b - a);
    const scores = grouped[dep].scores;
    const avg =
      scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      name: dep,
      count: grouped[dep].count,
      lastDate: dates[0].toISOString().split("T")[0],
      avg: avg.toFixed(2),
      color: getColorByAvg(avg)
    };
  });

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

        // 🔑 DUŻY PROMIEŃ – WYKRES JEST DUŻY
        const radius = arc.outerRadius * 0.72;

        const x = arc.x + Math.cos(angle) * radius;
        const y = arc.y + Math.sin(angle) * radius;

        const isActive = i === active;

        const titleSize = isActive ? 20 : 15;
        const textSize = isActive ? 15 : 13;
        const spacing = isActive ? 22 : 18;

        ctx.fillStyle = "#ffffff";

        // NAZWA DZIAŁU
        ctx.font = `bold ${titleSize}px sans-serif`;
        ctx.fillText(metrics[i].name, x, y - spacing);

        // ILOŚĆ AUDYTÓW
        ctx.font = `bold ${textSize}px sans-serif`;
        ctx.fillText(
          `Audytów: ${metrics[i].count}`,
          x,
          y
        );

        // OSTATNIA DATA
        ctx.font = `${textSize}px sans-serif`;
        ctx.fillText(
          metrics[i].lastDate,
          x,
          y + spacing
        );
      });

      ctx.restore();
    }
  };

  const options = {
    cutout: 0, // PEŁNE KOŁO
    responsive: true,
    maintainAspectRatio: false,
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
