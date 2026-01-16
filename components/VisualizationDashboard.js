import { useState, useMemo } from "react";
import PieChart from "./PieChart";

export default function VisualizationDashboard({ audits }) {
  const [activeDept, setActiveDept] = useState(null);

  // ===== AGREGACJA PER DZIAŁ =====
  const stats = useMemo(() => {
    const map = {};

    audits.forEach(a => {
      if (!map[a.department]) {
        map[a.department] = {
          scores: [],
          dates: [],
          comments: []
        };
      }
      map[a.department].scores.push(a.score);
      map[a.department].dates.push(new Date(a.date));
      if (a.comment) map[a.department].comments.push({
        text: a.comment,
        date: a.date
      });
    });

    const today = new Date();

    return Object.entries(map)
      .map(([dep, v]) => {
        const avg =
          v.scores.reduce((a, b) => a + b, 0) / v.scores.length;

        const lastDate = v.dates.sort((a, b) => b - a)[0];
        const daysAgo = Math.floor(
          (today - lastDate) / (1000 * 60 * 60 * 24)
        );

        return {
          department: dep,
          avg: avg.toFixed(2),
          daysAgo,
          comments: v.comments.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          )
        };
      })
      .sort((a, b) => b.daysAgo - a.daysAgo); // ⬅️ KLUCZ
  }, [audits]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        gap: "20px",
        alignItems: "start"
      }}
    >
      {/* ===== LEWA TABELA ===== */}
      <div style={box}>
        <h4>Kontrola działów</h4>
        <table style={table}>
          <thead>
            <tr>
              <th>Dział</th>
              <th>Śr.</th>
              <th>Dni</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(s => (
              <tr
                key={s.department}
                style={{
                  background:
                    activeDept === s.department ? "#eef3ff" : "transparent"
                }}
              >
                <td>{s.department}</td>
                <td>{s.avg}</td>
                <td>{s.daysAgo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== WYKRES ===== */}
      <PieChart
        audits={audits}
        onHoverDepartment={setActiveDept}
      />

      {/* ===== PRAWA TABELA ===== */}
      <div style={box}>
        <h4>Komentarze</h4>

        {!activeDept && (
          <p style={{ opacity: 0.6 }}>
            Najedź na dział
          </p>
        )}

        {activeDept &&
          stats
            .find(s => s.department === activeDept)
            ?.comments.map((c, i) => (
              <div key={i} style={comment}>
                <div style={{ fontSize: "12px", opacity: 0.6 }}>
                  {c.date}
                </div>
                <div>{c.text}</div>
              </div>
            ))}

        {activeDept &&
          stats.find(s => s.department === activeDept)
            ?.comments.length === 0 && (
            <p>Brak komentarzy</p>
          )}
      </div>
    </div>
  );
}

const box = {
  background: "#f9f9f9",
  borderRadius: "12px",
  padding: "15px"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const comment = {
  background: "#fff",
  padding: "10px",
  borderRadius: "8px",
  marginBottom: "10px"
};
