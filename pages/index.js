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

const USERS = ["PRZEMYSŁAW DERDAŚ"];

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: USERS[0], pass: "" });
  
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
    if (isLoggedIn) load();
  }, [isLoggedIn]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.user === "PRZEMYSŁAW DERDAŚ" && loginForm.pass === "POWERUSER") {
      setIsLoggedIn(true);
    } else {
      alert("Błędne hasło!");
    }
  };

  const submit = async () => {
    await fetch("/api/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ department: DEPARTMENTS[0], date: today(), score: 3, comment: "" });
    load();
  };

  const getScoreColor = (score) => {
    if (score >= 4) return "#ffcccc";
    if (score === 3) return "#fff3cd";
    return "#d4edda";
  };

  const getDaysColor = (days) => {
    if (days === null) return "transparent";
    if (days > 14) return "#ffcccc";
    if (days >= 5) return "#fff3cd";
    return "#d4edda";
  };

  // EKRAN LOGOWANIA
  if (!isLoggedIn) {
    return (
      <div style={styles.page}>
        {/* WIĘKSZY LOGOTYP */}
        <div style={styles.logoContainer}>
          <svg viewBox="0 0 100 100" style={styles.millIcon}>
             {/* Gruby biały kontur zewnętrzny */}
             <path 
               d="M50 5 L90 45 L85 90 L15 90 L10 45 Z" 
               fill="none" 
               stroke="white" 
               strokeWidth="5" 
               strokeLinejoin="round" 
             />
             {/* Błękitna bryła */}
             <path 
               d="M50 5 L90 45 L85 90 L15 90 L10 45 Z" 
               fill="#4fc3f7" 
             />
             {/* Skrzydła X */}
             <g stroke="white" strokeWidth="5" strokeLinecap="round">
               <line x1="20" y1="20" x2="80" y2="70" />
               <line x1="80" y1="20" x2="20" y2="70" />
             </g>
             {/* Środek skrzydeł */}
             <circle cx="50" cy="45" r="6" fill="#4fc3f7" stroke="white" strokeWidth="3" />
             {/* Drzwi */}
             <path d="M40 90 V72 Q50 64 60 72 V90" fill="#01579b" />
          </svg>
          <h1 style={styles.mainTitle}>MŁYN SPRAWIEDLIWOŚCI</h1>
        </div>

        <div style={styles.loginCard}>
          <h2 style={styles.title}>LOGOWANIE</h2>
          <form onSubmit={handleLogin}>
            <label style={styles.label}>Użytkownik:</label>
            <select 
              style={styles.input}
              value={loginForm.user}
              onChange={e => setLoginForm({...loginForm, user: e.target.value})}
            >
              {USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            
            <label style={styles.label}>Hasło:</label>
            <input 
              type="password"
              style={styles.input}
              value={loginForm.pass}
              onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
              placeholder="Wpisz hasło"
            />
            
            <button type="submit" style={styles.submit}>Zaloguj się</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.tabs}>
        <button onClick={() => setTab("form")} style={tab === "form" ? styles.activeTab : styles.tab}>
          📝 WPROWADŹ AUDYT
        </button>
        <button onClick={() => setTab("chart")} style={tab === "chart" ? styles.activeTab : styles.tab}>
          📊 WIZUALIZACJA
        </button>
      </div>

      <div style={styles.content}>
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

        {tab === "chart" && (
          <div style={styles.dashboard}>
            <div style={styles.sideCard}>
              <h3 style={{ ...styles.sideTitle, textAlign: "center" }}>DZIAŁY</h3>
              <div style={{ overflowY: "auto", height: "calc(100% - 60px)" }}>
                <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse", border: "1px solid #ddd" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #ddd" }}>
                      <th style={styles.tableHeader}>Dział</th>
                      <th style={styles.tableHeader}>Dni</th>
                      <th style={styles.tableHeader}>Śr.</th>
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
                          <tr key={r.dep} style={{ borderBottom: "1px solid #ddd" }}>
                            <td style={styles.tableCell}>{r.dep}</td>
                            <td style={styles.tableCell}>
                              <span style={{
                                background: getDaysColor(r.daysAgo),
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontWeight: "bold",
                                color: "#333",
                                display: "inline-block",
                                minWidth: "25px",
                                textAlign: "center"
                              }}>
                                {r.daysAgo ?? "—"}
                              </span>
                            </td>
                            <td style={{ ...styles.tableCell, fontWeight: "bold", color: "#1e3c72" }}>{r.avg}</td>
                          </tr>
                        ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={styles.centerCard}>
              <PieChart audits={audits} />
            </div>

            <div style={styles.sideCard}>
              <h3 style={{ ...styles.sideTitle, textAlign: "center" }}>KOMENTARZE</h3>
              <select
                style={styles.input}
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
              >
                <option value="">— wybierz dział —</option>
                {[...new Set(audits.map(a => a.department))].sort().map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <div style={styles.scrollArea}>
                {selectedDepartment && audits
                  .filter(a => a.department === selectedDepartment)
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((audit, idx) => (
                    <div key={idx} style={styles.historyItem}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", alignItems: "center" }}>
                        <span style={{ opacity: 0.7 }}>📅 {audit.date}</span>
                        <span style={{
                          background: getScoreColor(audit.score),
                          padding: "2px 10px",
                          borderRadius: "10px",
                          fontWeight: "bold",
                          color: "#333",
                          fontSize: "11px"
                        }}>
                          OCENA: {audit.score}
                        </span>
                      </div>
                      <div style={styles.commentBox}>
                        {audit.comment || <i style={{ opacity: 0.5 }}>Brak komentarza</i>}
                      </div>
                    </div>
                  ))
                }
                {!selectedDepartment && <p style={{ textAlign: "center", opacity: 0.5, marginTop: "20px" }}>Wybierz dział, aby zobaczyć historię</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:{minHeight:"100vh",background:"linear-gradient(135deg,#1e3c72,#2a5298)",padding:"40px",color:"#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"},
  logoContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' },
  millIcon: { width: '220px', height: '220px' },
  mainTitle: { color: 'white', marginTop: '15px', fontSize: '32px', fontWeight: '900', letterSpacing: '4px', textShadow: '2px 2px 10px rgba(0,0,0,0.5)' },
  loginCard: {background: "#fff", color: "#333", padding: "40px", borderRadius: "24px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 50px rgba(0,0,0,0.5)"},
  label: {display: "block", marginBottom: "8px", fontWeight: "bold", color: "#1e3c72"},
  tabs:{display:"flex",justifyContent:"space-between",width:"100%",maxWidth:"900px",margin:"0 auto 30px"},
  tab:{width:"48%",height:"56px",fontSize:"18px",borderRadius:"14px",border:"none",background:"rgba(255,255,255,0.25)",color:"#fff", cursor:"pointer"},
  activeTab:{width:"48%",height:"56px",fontSize:"18px",borderRadius:"14px",border:"none",background:"#fff",color:"#1e3c72",fontWeight:"bold", cursor:"pointer"},
  content:{width: "100%"},
  card:{background:"#fff",color:"#333",borderRadius:"18px",padding:"30px", maxWidth: "800px", margin: "0 auto"},
  title:{textAlign:"center",marginBottom:"24px",color:"#1e3c72"},
  input:{width:"100%",height:"52px",padding:"0 14px",marginBottom:"16px",borderRadius:"10px",border:"1px solid #ccc",boxSizing: "border-box"},
  textarea:{width:"100%",height:"110px",padding:"14px",marginBottom:"20px",borderRadius:"10px",border:"1px solid #ccc",boxSizing: "border-box",fontFamily: "inherit",resize: "none"},
  submit:{width:"100%",height:"56px",borderRadius:"14px",border:"none",background:"#1e3c72",color:"#fff", cursor: "pointer", fontWeight: "bold"},
  scoreRow:{display:"flex",justifyContent:"space-between",margin:"10px 0"},
  scoreBox:{width:"18%",height:"52px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"10px",cursor:"pointer",fontWeight:"bold"},
  dashboard:{display:"grid",gridTemplateColumns:"440px 1fr 440px",gap:"40px",maxWidth:"1900px",margin:"0 auto"},
  sideCard:{background:"#fff",borderRadius:"18px",padding:"24px",height:"820px",color:"#333", display: "flex", flexDirection: "column"},
  centerCard:{background:"#fff",borderRadius:"18px",padding:"24px",height:"820px"},
  sideTitle:{color:"#1e3c72",marginBottom:"16px",fontWeight:"bold"},
  scrollArea: {flex: 1, overflowY: "auto", paddingRight: "10px"},
  historyItem: {marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px"},
  commentBox:{marginTop:"4px",padding:"12px",borderRadius:"10px",background:"#f5f7fb",lineHeight:"1.4",fontSize:"14px",wordBreak:"break-word",whiteSpace:"pre-wrap"},
  tableHeader: { padding: "12px 5px", textAlign: "center", borderRight: "1px solid #ddd" },
  tableCell: { padding: "10px 5px", textAlign: "center", borderRight: "1px solid #ddd" }
};
