import { useEffect, useState } from "react";
import PieChart from "../components/PieChart";

export default function Home() {
  const [tab, setTab] = useState("form");
  const [audits, setAudits] = useState([]);
  const [form, setForm] = useState({
    department: "Produkcja",
    date: "",
    score: 5,
    comment: ""
  });

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
    setForm({ department: "Produkcja", date: "", score: 5, comment: "" });
    load();
    setTab("chart");
  };

  return (
    <div style={styles.page}>
      <div style={styles.tabs}>
        <button
          onClick={() => setTab("form")}
          style={tab === "form" ? styles.activeTab : styles.tab}
        >
          📝 WPROWADŹ AUDYT
        </button>
        <button
          onClick={() => setTab("chart")}
          style={tab === "chart" ? styles.activeTab : styles.tab}
        >
          📊 WIZUALIZACJA
        </button>
      </div>

      <div style={styles.content}>
        {tab === "form" && (
          <div style={styles.card}>
            <h2>Nowy audyt</h2>

            <select
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
              style={styles.input}
            >
              <option>Produkcja</option>
              <option>HR</option>
              <option>Finanse</option>
              <option>IT</option>
              <option>Logistyka</option>
            </select>

            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              style={styles.input}
            />

            <input
              type="number"
              min="1"
              max="10"
              value={form.score}
              onChange={e => setForm({ ...form, score: +e.target.value })}
              style={styles.input}
            />

            <textarea
              placeholder="Komentarz"
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              style={{ ...styles.input, height: "80px" }}
            />

            <button onClick={submit} style={styles.submit}>
              Dodaj audyt
            </button>
          </div>
        )}

        {tab === "chart" && (
          <div style={styles.card}>
            {audits.length > 0 ? (
              <PieChart audits={audits} />
            ) : (
              <p>Brak danych do wizualizacji</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
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
    padding: "20px",
    fontSize: "18px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "rgba(255,255,255,0.2)",
    color: "#fff"
  },
  activeTab: {
    width: "48%",
    padding: "20px",
    fontSize: "18px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    background: "#ffffff",
    color: "#1e3c72",
    fontWeight: "bold"
  },
  content: {
    maxWidth: "900px",
    margin: "0 auto"
  },
  card: {
    background: "#ffffff",
    color: "#333",
    borderRadius: "16px",
    padding: "30px"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  submit: {
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#1e3c72",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer"
  }
};
