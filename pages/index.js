import { useEffect, useState } from "react";
import PieChart from "../components/PieChart";

export default function Home() {
  const [audits, setAudits] = useState([]);
  const [form, setForm] = useState({
    department: "Produkcja",
    date: "",
    score: 5,
    comment: ""
  });

  useEffect(() => {
    fetch("/api/audits")
      .then(res => res.json())
      .then(setAudits);
  }, []);

  const submit = async () => {
    await fetch("/api/audits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const updated = await fetch("/api/audits").then(r => r.json());
    setAudits(updated);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Audyt</h1>

      <h2>Wprowadź audyt</h2>
      <input placeholder="Data" onChange={e => setForm({...form, date: e.target.value})} /><br />
      <input type="number" min="1" max="10"
        onChange={e => setForm({...form, score: Number(e.target.value)})} /><br />
      <button onClick={submit}>Dodaj</button>

      <h2>Wizualizacja</h2>
      {audits.length > 0 && <PieChart audits={audits} />}
    </div>
  );
}
