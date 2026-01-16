let audits = [];

export default function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(audits);
  }

  if (req.method === "POST") {
    const audit = req.body;
    audits.push(audit);
    return res.status(201).json({ success: true });
  }

  res.status(405).end();
}
