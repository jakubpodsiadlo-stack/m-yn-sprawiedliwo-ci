import { useState, useMemo } from "react";
import PieChart from "./PieChart";

export default function VisualizationDashboard({ audits }) {
  const [activeDept, setActiveDept] = useState(null);

  // ===== AGREGACJA DANYCH =====
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
      if (a.comment) {
        map[a.department].comments.push({
          text: a.comment,
          date: a.date
        });
      }
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
      .sort((a, b) => b.daysAgo - a.daysAgo);
  }, [audits]);

  return (
    <div style={{ display: "grid", gap: "30px" }}>
      {/* ===== WYKRES (GÓRA) ===== */}
      <div style={chartBox}>
        <div style={{ maxWidth: "520px", margin: "0 auto" }}>
          <PieChart
            audits={audits}
            onHoverDepartment={setActiveDept}
          />
        </div>
      </div>

      {/* ===== DÓŁ: TABELKI ===== */}
      <div style={bottomGrid}>
        {/* LEWA: DZIAŁY */}
        <div style={box}>
          <h3 style={title}>Kontrola działów</h3>
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
                      activeDept === s.department
                        ? "#eef3ff"
                        : "transparent"
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

        {/* PRAWA: KOMENTARZE */}
        <div style={box}>
          <h3 style={title}>Komentarze</h3>

          {!activeDept && (
            <p style={{ opacity: 0.6 }}>
              Najedź na dział na wykresie
            </p>
          )}

          {activeDept &&
            stats
              .find(s => s.department === activeDept)
              ?.comments.map((c, i) => (
                <div key={i} style={comment}>
                  <div style={commentDate}>{c.date}</div>
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
    </div>
  );
}

/* ===== STYLES ===== */

const chartBox = {
  background: "#ffffff",
  borderRadius: "18px",
  padding: "30px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const bottomGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px"
};

const box = {
  background: "#ffffff",
  borderRadius: "16px",
  padding: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
};

const title = {
  marginBottom: "15px",
  color: "#1e3c72"
};

const table = {
  width: "100%",
  borderCollapse: "collapse"
};

const comment = {
  background: "#f9f9f9",
  padding: "12px",
  borderRadius: "10px",
  marginBottom: "10px"
};

const commentDate = {
  fontSize: "12px",
  opacity: 0.6,
  marginBottom: "4px"
};
