import { useEffect, useRef } from "react";
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
  const chartRef = useRef(null);

  // ===== AUTO RESIZE / REFRESH =====
  useEffect(() => {
    const resize = () => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    };

    // po renderze
    setTimeout(resize, 100);

    // przy resize okna
    window.addEventListener("resize", resize);

    // fallback: auto refresh co 1s (lekki, bezpieczny)
    const interval = setInterval(resize, 1000);

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(interval);
    };
  }, [audits]);

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
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      name: dep,
      count: grouped[dep].count,
      lastDate: dates[0].toISOString().split("T")[0],
      avg,
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

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      meta.data.forEach((arc, i) => {
        const angle = (arc.startAngle + arc.endAngle) / 2;
        const radius = arc.outerRadius * 0.75;

        const x = arc.x + Math.cos(angle) * radius;
        const y = arc.y + Math.sin(angle) * radius;

        ctx.fillStyle = "#ffffff";

        ctx.font = "bold 15px sans-serif";
        ctx.fillText(metrics[i].name, x, y - 18);

        ctx.font = "bold 13px sans-serif";
        ctx.fillText(`Audytów: ${metrics[i].count}`, x, y);

        ctx.font = "13px sans-serif";
        ctx.fillText(metrics[i].lastDate, x, y + 18);
      });

      ctx.restore();
    }
  };

  const options = {
    cutout: 0,
    responsive: true,
    maintainAspectRatio: false,
    animation: false, // 🔑 stabilność
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  };

  return (
    <Doughnut
      ref={chartRef}
      data={data}
      options={options}
      plugins={[segmentTextPlugin]}
    />
  );
}
