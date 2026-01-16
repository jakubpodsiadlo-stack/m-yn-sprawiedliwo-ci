import { useEffect, useMemo, useState } from "react";
import PieChart from "../components/PieChart";

const todayStr = () => new Date().toISOString().split("T")[0];
const todayDate = new Date();

const DEPARTMENTS = [
  "CC","HR","KADRY","KSIĘGOWOŚĆ",
  "PH MATEUSZ HOWIS","PH BARTŁOMIEJ JĘDRZEJEC",
  "PH SYLWESTER KAWALEC","PH JAN DYDUCH",
  "PH ALEKSANDER ZAGAJEWSKI","PH DAWID KANIA",
  "PH BARTOSZ SIEDLECKI","PH JAKUB HARASIMOWICZ",
  "PRĄD DLA BIZNESU","SZKOLENIA","ADMINISTRATOR",
  "KONTROLA JAKOŚCI CC","KONTROLA JAKOŚCI PH",
  "MAGAZYNY","RETENCJA","TERMO",
  "DZIAŁ DOTACJI I ZGŁOSZEŃ ZE",
  "DZIAŁ OBSŁUGI KLIENTA","DZIAŁ ZAKUPÓW",
  "FAKTURY","KREDYTY","MARKETING","PV"
];

export default function Home() {
  const [tab, setTab] = useState("form");
  const [audits, setAudits] = useState([]);
  const [form, setForm] = useState({
    department: DEPARTMENTS[0],
    date: todayStr(),
    score: 3,
    comment: ""
  });

  // ===== LOAD =====
  const load = async () => {
    const res = await fetch("/api/audits");
    setAudits(await res.json());
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    await fetch("/api/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setForm({
      department: DEPARTMENTS[0],
      date: todayStr(),
      score: 3,
      comment: ""
    });

    load();
  };

  // ===== TABELA =====
  const tableData = useMemo(() => {
    const grouped = {};

    audits.forEach(a => {
      if (!grouped[a.department]) {
        grouped[a.department] = { dates: [], scores: [] };
      }
      if (a.date) grouped[a.department].dates.push(new Date(a.date));
      if (typeof a.score === "number") grouped[a.department].scores.push(a.score);
    });

    return Object.entries(grouped)
      .map(([department, d]) => {
        const last = d.dates.sort((a, b) => b - a)[0];
        const daysAgo = last
          ? Math.floor((todayDate - last) / (1000 * 60 * 60 * 24))
          : null;

        const avg =
          d.scores.length
            ? (d.scores.reduce((a, b) => a + b, 0) / d.scores.length).toFixed(2)
            : "-";

        return { department, daysAgo, avg };
      })
      .sort((a, b) => (b.daysAgo ?? -1) - (a.daysAgo ?? -1));
  }, [audits]);

  return (
    <div style={styles.page}>
      {/* ===== TABS ===== */}
      <div style={styles.tabs}>
        <button
          onClick={() => setTab("form")}
          style={tab === "form" ? styles.activeTab : styles.tab}
        >📝 WPROWADŹ AUDYT</button>

        <button
          onClick={() => setTab("chart")}
          style={tab === "chart" ? styles.activeTab : styles.tab}
        >📊 WIZUALIZACJA</button>
      </div>

      <div style={styles.content}>
        {/* ===== FORM ===== */}
        {tab === "form" && (
          <div style={styles.card}>
            <h2 style={styles.title}>NOWY AUDYT</h2>

            <select
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
              style={styles.input}
            >
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>

            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              style={styles.input}
            />

            <p><b>Poziom niezadowolenia: {form.score}</b></p>

            <div style={styles.scoreRow}>
              {[1,2,3,4,5].map(n => (
                <div
                  key={n}
                  onClick={() => setForm({ ...form, score: n })}
                  style={{
                    ...styles.scoreBox,
                    background: form.score === n ? "#1e3c72" : "#e0e0e0",
                    color: form.score === n ? "#fff" : "#333"
                  }}
                >{n}</div>
              ))}
            </div>

            <textarea
              placeholder="Komentarz"
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              style={styles.textarea}
            />

            <button onClick={submit} style={styles.submit}>Dodaj audyt</button>
          </div>
        )}

        {/* ===== DASHBOARD ===== */}
        {tab === "chart" && (
          <div style={styles.dashboard}>
            {/* ===== LEWY PROSTOKĄT – TABELA ===== */}
            <div style={styles.tableCard}>
              <h3 style={styles.tableTitle}>Dni od ostatniego audytu</h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Dział</th>
                    <th>Dni</th>
                    <th>Śr.</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map(r => (
                    <tr key={r.department}>
                      <td>{r.department}</td>
                      <td>{r.daysAgo ?? "—"}</td>
                      <td>{r.avg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ===== PRAWY PROSTOKĄT – KOŁO ===== */}
            <div style={styles.chartCard}>
              <PieChart audits={audits} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#1e3c72,#2a5298)",
    padding: "40px",
    color: "#fff"
  },
  tabs: {
    display: "flex",
    justifyContent: "space-between",
    maxWidth: "900px",
    margin: "0 auto 30px"
  },
  tab: {
    width: "48%",
    height: "56px",
    borderRadius: "14px",
    border: "none",
    background: "rgba(255,255,255,.25)",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer"
  },
  activeTab: {
    width: "48%",
    height: "56px",
    borderRadius: "14px",
    border: "none",
    background: "#fff",
    color: "#1e3c72",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  content: {
    maxWidth: "1600px",
    margin: "0 auto"
  },
  card: {
    background: "#fff",
    color: "#333",
    borderRadius: "18px",
    padding: "30px"
  },

  /* DASHBOARD */
  dashboard: {
    display: "flex",
    gap: "24px"
  },
  tableCard: {
    width: "420px",
    background: "#fff",
    color: "#333",
    borderRadius: "18px",
    padding: "20px",
    maxHeight: "820px",
    overflowY: "auto"
  },
  chartCard: {
    flex: 1,
    background: "#fff",
    borderRadius: "18px",
    padding: "20px",
    height: "820px"
  },

  tableTitle: {
    marginBottom: "12px",
    color: "#1e3c72"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px"
  },

  input: {
    width: "100%",
    height: "52px",
    marginBottom: "16px",
    padding: "0 14px",
    borderRadius: "10px",
    border: "1px solid #ccc"
  },
  textarea: {
    width: "100%",
    height: "110px",
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    resize: "none"
  },
  submit: {
    width: "100%",
    height: "56px",
    borderRadius: "14px",
    border: "none",
    background: "#1e3c72",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer"
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
    margin: "16px 0"
  },
  scoreBox: {
    width: "18%",
    height: "52px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontWeight: "bold"
  }
};
