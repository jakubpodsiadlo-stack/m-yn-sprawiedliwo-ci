import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("audits")
      .select("*")
      .order("date", { ascending: true });

    if (error) return res.status(500).json(error);
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { department, date, score, comment } = req.body;

    const { error } = await supabase.from("audits").insert([
      { department, date, score, comment }
    ]);

    if (error) return res.status(500).json(error);
    return res.status(201).json({ success: true });
  }

  res.status(405).end();
}
