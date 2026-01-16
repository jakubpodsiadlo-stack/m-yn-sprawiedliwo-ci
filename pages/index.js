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

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    await fetch("/api/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setForm({
      department: "Produkcja",
      date: "",
      score: 5,
      comment: ""
    });

    load();
    setTab("chart");
  };

  return (
    <div style={styles.page}>
      {/* ZAKŁADKI */}
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

      {/* ZAWARTOŚĆ */}
      <div style={styles.content}>
        {tab === "form" && (
          <div style={styles.card}>
            <h2 style={styles.title}>NOWY AUDYT</h2>

            <select
              value={form.department}
              onChange={e =>
                setForm({ ...form, department: e.target.value })
              }
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
              onChange={e =>
                setForm({ ...form, date: e.target.value })
              }
              style={styles.input}
            />

            {/* SKALA 1–10 */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontWeight: "bold" }}>
                Ocena: {form.score}
              </p>

              <div style={styles.scoreRow}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <div
                    key={n}
                    onClick={() => setForm({ ...form, score: n })}
                    style={{
                      ...styles.scoreBox,
                      background:
                        form.score === n ? "#1e3c72" : "#e0e0e0",
                      color:
                        form.score === n ? "#fff" : "#333"
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>

            <textarea
              placeholder="Komentarz"
              value={form.comment}
              onChange={e =>
                setForm({ ...form, comment: e.target.value })
              }
              style={{ ...styles.input, height: "90px" }}
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
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    background: "rgba(255,255,255,0.25)",
    color: "#fff"
  },
  activeTab: {
    width: "48%",
    padding: "20px",
    fontSize: "18px",
    borderRadius: "14px",
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
    borderRadius: "18px",
    padding: "30px"
  },
  title: {
    textAlign: "center",
    letterSpacing: "2px",
    marginBottom: "25px",
    color: "#1e3c72"
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
    borderRadius: "12px",
    border: "none",
    background: "#1e3c72",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer"
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between"
  },
  scoreBox: {
    width: "8%",
    padding: "10px 0",
    textAlign: "center",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    userSelect: "none"
  }
};
