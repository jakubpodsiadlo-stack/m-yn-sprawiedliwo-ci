import { useEffect, useState } from "react";
import PieChart from "../components/PieChart";

// ===== DZISIEJSZA DATA (YYYY-MM-DD) =====
const today = () => new Date().toISOString().split("T")[0];

const DEPARTMENTS = [
  "CC",
  "HR",
  "KADRY",
  "KSIĘGOWOŚĆ",
  "PH MATEUSZ HOWIS",
  "PH BARTŁOMIEJ JĘDRZEJEC",
  "PH SYLWESTER KAWALEC",
  "PH JAN DYDUCH",
  "PH ALEKSANDER ZAGAJEWSKI",
  "PH DAWID KANIA",
  "PH BARTOSZ SIEDLECKI",
  "PH JAKUB HARASIMOWICZ",
  "PRĄD DLA BIZNESU",
  "SZKOLENIA",
  "ADMINISTRATOR",
  "KONTROLA JAKOŚCI CC",
  "KONTROLA JAKOŚCI PH",
  "MAGAZYNY",
  "RETENCJA",
  "TERMO",
  "DZIAŁ DOTACJI I ZGŁOSZEŃ ZE",
  "DZIAŁ OBSŁUGI KLIENTA",
  "DZIAŁ ZAKUPÓW",
  "FAKTURY",
  "KREDYTY",
  "MARKETING",
  "PV"
];

export default function Home() {
  const [tab, setTab] = useState("form");
  const [audits, setAudits] = useState([]);
  const [form, setForm] = useState({
    department: DEPARTMENTS[0],
    date: today(),          // 👈 DOMYŚLNIE DZIŚ
    score: 3,
    comment: ""
  });

  // ===== LOAD AUDITS =====
  const load = async () => {
    const res = await fetch("/api/audits");
    setAudits(await res.json());
  };

  useEffect(() => {
    load();
  }, []);

  // ===== SUBMIT =====
  const submit = async () => {
    await fetch("/api/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    setForm({
      department: DEPARTMENTS[0],
      date: today(),        // 👈 PO ZAPISIE ZNOWU DZIŚ
      score: 3,
      comment: ""
    });

    load();
    setTab("chart");
  };

  return (
    <div style={styles.page}>
      {/* ===== ZAKŁADKI ===== */}
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

      {/* ===== CONTENT ===== */}
      <div style={styles.content}>
        {/* ===== FORM ===== */}
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
              {DEPARTMENTS.map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>

            <input
              type="date"
              value={form.date}
              onChange={e =>
                setForm({ ...form, date: e.target.value })
              }
              style={styles.input}
            />

            {/* ===== POZIOM NIEZADOWOLENIA 1–5 ===== */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontWeight: "bold" }}>
                Poziom niezadowolenia: {form.score}
              </p>
              <p style={{ fontSize: "12px", opacity: 0.6 }}>
                1 = bardzo dobrze · 5 = bardzo źle
              </p>

              <div style={styles.scoreRow}>
                {[1,2,3,4,5].map(n => (
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

        {/* ===== WIZUALIZACJA ===== */}
        {tab === "chart" && (
          <div style={styles.card}>
            {audits.length > 0 ? (
              <div style={{ maxWidth: "520px", margin: "0 auto" }}>
                <PieChart audits={audits} />
              </div>
            ) : (
              <p>Brak danych do wizualizacji</p>
            )}
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
    width: "18%",
    padding: "12px 0",
    textAlign: "center",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    userSelect: "none"
  }
};
