import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ audits }) {
  const deptCount = {};

  audits.forEach(a => {
    deptCount[a.department] = (deptCount[a.department] || 0) + 1;
  });

  const lastAudit = audits[audits.length - 1];
  const last5 = audits.slice(-5);
  const avg =
    last5.reduce((sum, a) => sum + a.score, 0) / last5.length;

  const data = {
    labels: Object.keys(deptCount),
    datasets: [
      {
        data: Object.values(deptCount)
      }
    ]
  };

  return (
    <>
      <Pie data={data} />
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <strong>Ostatni audyt:</strong> {lastAudit.date}<br />
        <strong>Średnia (5):</strong> {avg.toFixed(2)}
      </div>
    </>
  );
}
