import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

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
      grouped[a.department] = { count: 0, dates: [], scores: [] };
    }
    grouped[a.department].count++;
    if (a.date) grouped[a.department].dates.push(new Date(a.date));
    grouped[a.department].scores.push(a.score);
  });

  const labels = Object.keys(grouped);

  const metrics = labels.map(dep => {
    const dates = grouped[dep].dates.sort((a, b) => b - a);
    const avg =
      grouped[dep].scores.reduce((a, b) => a + b, 0) /
      grouped[dep].scores.length;

    return {
      name: dep,
      count: grouped[dep].count,
      lastDate: dates[0]?.toISOString().split("T")[0] ?? "",
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

  // ===== RADIALNY TEKST =====
  const radialTextPlugin = {
    id: "radialText",
    afterDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);

      ctx.save();
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      meta.data.forEach((arc, i) => {
        const angleMid = (arc.startAngle + arc.endAngle) / 2;
        const angleSize = arc.endAngle - arc.startAngle;

        if (angleSize < 0.15) return; // za mały kafelek

        const r = arc.outerRadius * 0.78;
        const x = arc.x + Math.cos(angleMid) * r;
        const y = arc.y + Math.sin(angleMid) * r;

        let rotation = angleMid;
        if (rotation > Math.PI / 2 && rotation < (3 * Math.PI) / 2) {
          rotation += Math.PI; // odwrócenie, żeby nie było do góry nogami
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        ctx.font = "bold 13px sans-serif";
        ctx.fillText(metrics[i].name, 0, -14);

        ctx.font = "13px sans-serif";
        ctx.fillText(`Audytów: ${metrics[i].count}`, 0, 0);

        ctx.font = "13px sans-serif";
        ctx.fillText(metrics[i].lastDate, 0, 14);

        ctx.restore();
      });

      ctx.restore();
    }
  };

  const options = {
    cutout: 0,
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
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
      plugins={[radialTextPlugin]}
    />
  );
}
