import { useEffect, useState } from "react";
import PieChart from "../components/PieChart";

const today = () => new Date().toISOString().split("T")[0];

const DEPARTMENTS = [
  "CC","HR","KADRY","KSIĘGOWOŚĆ",
  "PH MATEUSZ HOWIS","PH BARTŁOMIEJ JĘDRZEJEC","PH SYLWESTER KAWALEC",
  "PH JAN DYDUCH","PH ALEKSANDER ZAGAJEWSKI","PH DAWID KANIA",
  "PH BARTOSZ SIEDLECKI","PH JAKUB HARASIMOWICZ",
  "PRĄD DLA BIZNESU","SZKOLENIA","ADMINISTRATOR",
  "KONTROLA JAKOŚCI CC","KONTROLA JAKOŚCI PH","MAGAZYNY",
  "RETENCJA","TERMO","DZIAŁ DOTACJI I ZGŁOSZEŃ ZE",
  "DZIAŁ OBSŁUGI KLIENTA","DZIAŁ ZAKUPÓW","FAKTURY",
  "KREDYTY","MARKETING","PV"
];

export default function Home() {
  const [tab, setTab] = useState("form");
  const [audits, setAudits] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [form, setForm] = useState({
    department: DEPARTMENTS[0],
    date: today(),
    score: 3,
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
      department: DEPARTMENTS[0],
      date: today(),
      score: 3,
      comment: ""
    });

    load();
  };

  return (
    <div style={styles.page}>
      {/* ZAKŁADKI */}
      <div style={styles.tabs}>
        <button onClick={() => setTab("form")} style={tab === "form" ? styles.activeTab : styles.tab}>
          📝 WPROWADŹ AUDYT
        </button>
        <button onClick={() => setTab("chart")} style={tab === "chart" ? styles.activeTab : styles.tab}>
          📊 WIZUALIZACJA
        </button>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>
        {/* FORM */}
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

            <p style={{ fontWeight: "bold" }}>Poziom niezadowolenia: {form.score}</p>

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
                >
                  {n}
                </div>
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

        {/* DASHBOARD */}
        {tab === "chart" && (
          <div style={styles.dashboard}>
            {/* LEWA TABELA */}
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Działy</h3>
              <table style={{ width: "100%", fontSize: "14px" }}>
                <thead>
                  <tr style={{ opacity: 0.6 }}>
                    <th align="left">Dział</th>
                    <th align="right">Dni</th>
                    <th align="right">Śr.</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const todayD = new Date();
                    const grouped = {};

                    audits.forEach(a => {
                      if (!grouped[a.department]) grouped[a.department] = { dates: [], scores: [] };
                      if (a.date) grouped[a.department].dates.push(new Date(a.date));
                      if (typeof a.score === "number") grouped[a.department].scores.push(a.score);
                    });

                    return Object.entries(grouped)
                      .map(([dep, d]) => {
                        const last = d.dates.sort((a,b)=>b-a)[0];
                        const daysAgo = last ? Math.floor((todayD-last)/(1000*60*60*24)) : null;
                        const avg = d.scores.length ? (d.scores.reduce((a,b)=>a+b,0)/d.scores.length).toFixed(2) : "-";
                        return { dep, daysAgo, avg };
                      })
                      .sort((a,b)=>(b.daysAgo??-1)-(a.daysAgo??-1))
                      .map(r => (
                        <tr key={r.dep}>
                          <td>{r.dep}</td>
                          <td align="right">{r.daysAgo ?? "—"}</td>
                          <td align="right">{r.avg}</td>
                        </tr>
                      ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* ŚRODEK – KOŁO */}
            <div style={styles.centerCard}>
              <PieChart audits={audits} />
            </div>

            {/* PRAWA STRONA – KOMENTARZE */}
            <div style={styles.sideCard}>
              <h3 style={styles.sideTitle}>Szczegóły audytu</h3>

              <select
                style={styles.input}
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
              >
                <option value="">— wybierz dział —</option>
                {[...new Set(audits.map(a => a.department))].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {selectedDepartment && (() => {
                const filtered = audits
                  .filter(a => a.department === selectedDepartment)
                  .sort((a,b)=>new Date(b.date)-new Date(a.date));

                if (!filtered.length) return <p style={{opacity:.6}}>Brak audytów</p>;

                const last = filtered[0];
                return (
                  <div style={{ fontSize: "14px" }}>
                    <p><b>Data:</b> {last.date}</p>
                    <p><b>Ocena:</b> {last.score}</p>
                    <div style={styles.commentBox}>
                      {last.comment || "Brak komentarza"}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== STYLES ===== */

const styles = {
  page:{minHeight:"100vh",background:"linear-gradient(135deg,#1e3c72,#2a5298)",padding:"40px",color:"#fff"},
  tabs:{display:"flex",justifyContent:"space-between",maxWidth:"900px",margin:"0 auto 30px"},
  tab:{width:"48%",height:"56px",fontSize:"18px",borderRadius:"14px",border:"none",background:"rgba(255,255,255,0.25)",color:"#fff"},
  activeTab:{width:"48%",height:"56px",fontSize:"18px",borderRadius:"14px",border:"none",background:"#fff",color:"#1e3c72",fontWeight:"bold"},
  content:{margin:"0 auto"},
  card:{background:"#fff",color:"#333",borderRadius:"18px",padding:"30px"},
  title:{textAlign:"center",marginBottom:"24px",color:"#1e3c72"},
  input:{width:"100%",height:"52px",padding:"0 14px",marginBottom:"16px",borderRadius:"10px",border:"1px solid #ccc"},
  textarea:{width:"100%",height:"110px",padding:"14px",marginBottom:"20px",borderRadius:"10px",border:"1px solid #ccc"},
  submit:{width:"100%",height:"56px",borderRadius:"14px",border:"none",background:"#1e3c72",color:"#fff"},
  scoreRow:{display:"flex",justifyContent:"space-between",margin:"10px 0"},
  scoreBox:{width:"18%",height:"52px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"10px",cursor:"pointer",fontWeight:"bold"},
  dashboard:{display:"grid",gridTemplateColumns:"440px 1fr 440px",gap:"40px",maxWidth:"1900px",margin:"0 auto"},
  sideCard:{background:"#fff",borderRadius:"18px",padding:"24px",height:"820px",color:"#333"},
  centerCard:{background:"#fff",borderRadius:"18px",padding:"24px",height:"820px"},
  sideTitle:{color:"#1e3c72",marginBottom:"16px"},
  commentBox:{marginTop:"12px",padding:"12px",borderRadius:"10px",background:"#f5f7fb",lineHeight:"1.4"}
};
