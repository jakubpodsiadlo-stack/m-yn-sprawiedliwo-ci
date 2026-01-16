import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = {
  CC: "#1e3c72",
  HR: "#2e7d32",
  KADRY: "#6a1b9a",
  KSIĘGOWOŚĆ: "#f57c00",
  MARKETING: "#c62828",
  PV: "#00838f"
};

export default function PieChart({ audits }) {
  const grouped = {};

  audits.forEach(a => {
    if (!grouped[a.department]) {
      grouped[a.department] = { count: 0, dates: [] };
    }
    grouped[a.department].count += 1;
    grouped[a.department].dates.push(new Date(a.date));
  });

  const labels = Object.keys(grouped);
  const values = labels.map(l => grouped[l].count);
  const colors = labels.map(l => COLORS[l] || "#999");

  const metrics = labels.map(dep => {
    const dates = grouped[dep].dates.sort((a, b) => b - a);
    const lastDate = dates[0].toISOString().split("T")[0];

    return {
      name: dep,
      count: grouped[dep].count,
      lastDate
    };
  });

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 16
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
        const radius =
          (arc.outerRadius + arc.innerRadius) / 2;

        const x = arc.x + Math.cos(angle) * radius;
        const y = arc.y + Math.sin(angle) * radius;

        const isActive = i === active;

        const titleSize = isActive ? 18 : 14;
        const textSize = isActive ? 14 : 12;
        const spacing = isActive ? 20 : 16;

        ctx.fillStyle = "#fff";

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
    cutout: "58%",
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
