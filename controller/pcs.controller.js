const db = require("../db");
const BUSY_STATUSES = ["pending", "confirmed", "active"];

class PcsController {
  async getByLabel(req, res) {
    try {
      const { label } = req.params;
      const q = `
        SELECT
          p.pc_id,
          p.label,
          p.specs,
          p.price, 
          p.is_active,
          EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.pc_id = p.pc_id
              AND b.status = ANY($2)
              AND now() >= b.start_time
              AND now() <  b.end_time
          ) AS is_busy,
          (
            SELECT b.end_time
            FROM bookings b
            WHERE b.pc_id = p.pc_id
              AND b.status = ANY($2)
              AND now() < b.end_time
            ORDER BY b.end_time DESC
            LIMIT 1
          ) AS busy_until
        FROM pcs p
        WHERE p.label = $1 AND p.is_active = TRUE
        LIMIT 1;
      `;
      const r = await db.query(q, [label, BUSY_STATUSES]);
      if (r.rowCount === 0)
        return res.status(404).json({ error: "PC not found" });
      res.json(r.rows[0]);
    } catch (e) {
      console.error("pcs.getByLabel error:", e);
      res.status(500).json({ error: e.message });
    }
  }

  async list(req, res) {
    try {
      const q = `
        SELECT
          p.pc_id,
          p.label,
          p.specs,
          p.price,  
          p.is_active,
          EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.pc_id = p.pc_id
              AND b.status = ANY($1)
              AND now() >= b.start_time
              AND now() <  b.end_time
          ) AS is_busy,
          (
            SELECT b.end_time
            FROM bookings b
            WHERE b.pc_id = p.pc_id
              AND b.status = ANY($1)
              AND now() < b.end_time
            ORDER BY b.end_time DESC
            LIMIT 1
          ) AS busy_until
        FROM pcs p
        WHERE p.is_active = TRUE
        ORDER BY p.pc_id;
      `;
      const r = await db.query(q, [BUSY_STATUSES]);
      res.json(r.rows);
    } catch (e) {
      console.error("pcs.list error:", e);
      res.status(500).json({ error: e.message });
    }
  }
}

module.exports = new PcsController();
