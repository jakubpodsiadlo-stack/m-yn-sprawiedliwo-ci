import { useEffect, useState } from "react";
import PieChart from "../components/PieChart";

const today = () => new Date().toISOString().split("T")[0];

const DEPARTMENTS = [
  "CC","HR","KADRY","KSIĘGOWOŚĆ",
  "PH MATEUSZ HOWIS","PH BARTŁOMIEJ JĘDRZEJEC","PH SYLWESTER KAWALEC",
  "PH JAN DYDUCH","PH ALEKSANDER ZAGAJEWSKI","PH DAWID KANIA",
  "PH BARTOSZ SIEDLECKI","PH JAKUB HARASIMOWICZ",
  "PRĄD DLA BIZNESU","SZKOLENIA","ADMINISTRACJA",
  "KONTROLA JAKOŚCI CC","KONTROLA JAKOŚCI PH","MAGAZYNY",
  "RETENCJA","TERMO","DZIAŁ DOTACJI I ZGŁOSZEŃ ZE",
  "DZIAŁ OBSŁUGI KLIENTA","DZIAŁ ZAKUPÓW","FAKTURY",
  "KREDYTY","MARKETING","PV"
];

const USERS = ["PRZEMYSŁAW DERDAŚ"];

export default function Home() {
  // Sprawdzanie localStorage przy inicjalizacji
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: USERS[0], pass: "" });
  
  const [tab, setTab] = useState("form");
  const [audits, setAudits] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [form, setForm] = useState({
    department: "",
    date: today(),
    score: 3,
    comment: ""
  });

  // Efekt sprawdzający sesję przy starcie
  useEffect(() => {
    const savedSession = localStorage.getItem("isLoggedIn");
    if (savedSession === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) load();
  }, [isLoggedIn]);

  const load = async () => {
    const res = await fetch("/api/audits");
    setAudits(await res.json());
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.user === "PRZEMYSŁAW DERDAŚ" && loginForm.pass === "POWERUSER") {
      setIsLoggedIn(true);
      localStorage.setItem("isLoggedIn", "true"); // Zapisanie sesji
    } else {
      alert("Błędne hasło!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn"); // Usunięcie sesji
  };

  const submit = async () => {
    if (!form.department) {
      alert("Proszę najpierw wybrać dział!");
      return;
    }
    await fetch("/api/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ department: "", date: today(), score: 3, comment: "" });
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

  if (!isLoggedIn) {
    return (
      <div style={styles.page}>
        <div style={styles.logoContainer}>
          <svg viewBox="0 0 100 100" style={styles.millIcon}>
            <path d="M50 8 L88 42 L82 92 L18 92 L12 42 Z" fill="rgba(79, 195, 247, 0.2)" filter="blur(4px)"/>
            <path d="M50 8 L88 42 L82 92 L18 92 L12 42 Z" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round" />
            <path d="M50 8 L88 42 L82 92 L18 92 L12 42 Z" fill="#4fc3f7" />
            <g stroke="white" strokeWidth="5" strokeLinecap="round">
              <line x1="50" y1="45" x2="85" y2="15" /><path d="M50 45 L85 15 L75 5 L40 35 Z" fill="rgba(255,255,255,0.3)" stroke="none" />
              <line x1="50" y1="45" x2="85" y2="75" /><path d="M50 45 L85 75 L95 65 L60 35 Z" fill="rgba(255,255,255,0.3)" stroke="none" />
              <line x1="50" y1="45" x2="15" y2="75" /><path d="M50 45 L15 75 L5 65 L40 35 Z" fill="rgba(255,255,255,0.3)" stroke="none" />
              <line x1="50" y1="45" x2="15" y2="15" /><path d="M50 45 L15 15 L25 5 L60 35 Z" fill="rgba(255,255,255,0.3)" stroke="none" />
            </g>
            <circle cx="50" cy="45" r="7" fill="#01579b" stroke="white" strokeWidth="2" />
            <path d="M42 92 V75 Q50 68 58 75 V92" fill="#01579b" stroke="white" strokeWidth="1" />
          </svg>
          <h1 style={styles.mainTitle}>MŁYN SPRAWIEDLIWOŚCI</h1>
        </div>
        <div style={styles.loginCard}>
          <h2 style={styles.title}>LOGOWANIE</h2>
          <form onSubmit={handleLogin}>
            <label style={styles.label}>Użytkownik:</label>
            <select style={styles.input} value={loginForm.user} onChange={e => setLoginForm({...loginForm, user: e.target.value})}>
              {USERS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <label style={styles.label}>Hasło:</label>
            <input type="password" style={styles.input} value={loginForm.pass} onChange={e => setLoginForm({...loginForm, pass: e.target.value})} placeholder="Wpisz hasło" />
            <button type="submit" style={styles.submit}>Zaloguj się</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* PASEK NAWIGACJI Z WYLOGOWANIEM */}
      <div style={styles.navBar}>
        <div style={styles.tabsWrapper}>
          <button onClick={() => setTab("form")} style={tab === "form" ? styles.activeTab : styles.tab}>📝 WPROWADŹ AUDYT</button>
          <button onClick={() => setTab("chart")} style={tab === "chart" ? styles.activeTab : styles.tab}>📊 WIZUALIZACJA</button>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>🚪 WYLOGUJ</button>
      </div>

      <div style={styles.content}>
        {tab === "form" && (
          <div style={styles.card}>
            <h2 style={styles.title}>NOWY AUDYT</h2>
            <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={styles.input}>
              <option value="" disabled>--- WYBIERZ DZIAŁ ---</option>
              {DEPARTMENTS.sort().map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={styles.input} />
            <p style={{ fontWeight: "bold" }}>Poziom niezadowolenia: {form.score}</p>
            <div style={styles.scoreRow}>
              {[1,2,3,4,5].map(n => (
                <div key={n} onClick={() => setForm({ ...form, score: n })} style={{ ...styles.scoreBox, background: form.score === n ? "#1e3c72" : "#e0e0e0", color: form.score === n ? "#fff" : "#333" }}>{n}</div>
              ))}
            </div>
            <textarea placeholder="Komentarz" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} style={styles.textarea} />
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
                    {Object.entries(audits.reduce((acc, a) => {
                      if (!acc[a.department]) acc[a.department] = { dates: [], scores: [] };
                      if (a.date) acc[a.department].dates.push(new Date(a.date));
                      if (typeof a.score === "number") acc[a.department].scores.push(a.score);
                      return acc;
                    }, {})).map(([dep, d]) => {
                      const todayD = new Date();
                      const last = d.dates.sort((a,b)=>b-a)[0];
                      const daysAgo = last ? Math.floor((todayD-last)/(1000*60*60*24)) : null;
                      const avg = d.scores.length ? (d.scores.reduce((a,b)=>a+b,0)/d.scores.length).toFixed(2) : "-";
                      return { dep, daysAgo, avg };
                    }).sort((a,b)=>(b.daysAgo??-1)-(a.daysAgo??-1)).map(r => (
                      <tr key={r.dep} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={styles.tableCell}>{r.dep}</td>
                        <td style={styles.tableCell}><span style={{ background: getDaysColor(r.daysAgo), padding: "2px 8px", borderRadius: "10px", fontWeight: "bold", color: "#333", display: "inline-block", minWidth: "25px", textAlign: "center" }}>{r.daysAgo ?? "—"}</span></td>
                        <td style={{ ...styles.tableCell, fontWeight: "bold", color: "#1e3c72" }}>{r.avg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={styles.centerCard}><PieChart audits={audits} /></div>
            <div style={styles.sideCard}>
              <h3 style={{ ...styles.sideTitle, textAlign: "center" }}>KOMENTARZE</h3>
              <select style={styles.input} value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
                <option value="">— wybierz dział —</option>
                {[...new Set(audits.map(a => a.department))].sort().map(d => (<option key={d} value={d}>{d}</option>))}
              </select>
              <div style={styles.scrollArea}>
                {selectedDepartment && audits.filter(a => a.department === selectedDepartment).sort((a, b) => new Date(b.date) - new Date(a.date)).map((audit, idx) => (
                  <div key={idx} style={styles.historyItem}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", alignItems: "center" }}>
                      <span style={{ opacity: 0.7 }}>📅 {audit.date}</span>
                      <span style={{ background: getScoreColor(audit.score), padding: "2px 10px", borderRadius: "10px", fontWeight: "bold", color: "#333", fontSize: "11px" }}>OCENA: {audit.score}</span>
                    </div>
                    <div style={styles.commentBox}>{audit.comment || <i style={{ opacity: 0.5 }}>Brak komentarza</i>}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:{minHeight:"100vh",background:"linear-gradient(135deg,#1e3c72,#2a5298)",padding:"20px 40px",color:"#fff", display: "flex", flexDirection: "column", alignItems: "center"},
  navBar: {display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "1200px", marginBottom: "30px"},
  tabsWrapper: {display: "flex", gap: "20px", flex: 1, justifyContent: "center"},
  logoContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px' },
  millIcon: { width: '200px', height: '200px', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))' },
  mainTitle: { color: 'white', marginTop: '10px', fontSize: '36px', fontWeight: '900', letterSpacing: '5px' },
  loginCard: {background: "#fff", color: "#333", padding: "40px", borderRadius: "24px", width: "100%", maxWidth: "400px", marginTop: "20px"},
  label: {display: "block", marginBottom: "8px", fontWeight: "bold", color: "#1e3c72"},
  tab:{width:"250px",height:"56px",fontSize:"16px",borderRadius:"14px",border:"none",background:"rgba(255,255,255,0.25)",color:"#fff", cursor:"pointer"},
  activeTab:{width:"250px",height:"56px",fontSize:"16px",borderRadius:"14px",border:"none",background:"#fff",color:"#1e3c72",fontWeight:"bold", cursor:"pointer"},
  logoutBtn: {background: "#ff4d4d", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "14px"},
  content:{width: "100%"},
  card:{background:"#fff",color:"#333",borderRadius:"18px",padding:"30px", maxWidth: "800px", margin: "0 auto"},
  title:{textAlign:"center",marginBottom:"24px",color:"#1e3c72"},
  input:{width:"100%",height:"52px",padding:"0 14px",marginBottom:"16px",borderRadius:"10px",border:"1px solid #ccc",boxSizing: "border-box"},
  textarea:{width:"100%",height:"110px",padding:"14px",marginBottom:"20px",borderRadius:"10px",border:"1px solid #ccc",boxSizing: "border-box",fontFamily: "inherit",resize: "none"},
  submit:{width:"100%",height:"56px",borderRadius:"14px",border:"none",background:"#1e3c72",color:"#fff", cursor: "pointer", fontWeight: "bold"},
  scoreRow:{display:"flex",justifyContent:"space-between",margin:"10px 0"},
  scoreBox:{width:"18%",height:"52px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"10px",cursor:"pointer",fontWeight:"bold"},
  dashboard:{display:"grid",gridTemplateColumns:"400px 1fr 400px",gap:"30px",maxWidth:"1800px",margin:"0 auto"},
  sideCard:{background:"#fff",borderRadius:"18px",padding:"20px",height:"800px",color:"#333", display: "flex", flexDirection: "column"},
  centerCard:{background:"#fff",borderRadius:"18px",padding:"20px",height:"800px"},
  sideTitle:{color:"#1e3c72",marginBottom:"16px",fontWeight:"bold"},
  scrollArea: {flex: 1, overflowY: "auto", paddingRight: "10px"},
  historyItem: {marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px"},
  commentBox:{marginTop:"4px",padding:"10px",borderRadius:"10px",background:"#f5f7fb",fontSize:"13px",wordBreak:"break-word",whiteSpace:"pre-wrap"},
  tableHeader: { padding: "10px 5px", textAlign: "center", borderRight: "1px solid #ddd" },
  tableCell: { padding: "10px 5px", textAlign: "center", borderRight: "1px solid #ddd" }
};
