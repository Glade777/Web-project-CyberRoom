// controller/bookings.controller.js
const db = require("../db");
const BLOCKING_STATUSES = ["pending", "confirmed", "active"];

function extractRate(priceStr) {
  if (!priceStr) return NaN;
  const match = String(priceStr)
    .replace(",", ".")
    .match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : NaN;
}

class BookingsController {
  async create(req, res) {
    try {
      const { user_id, pc_id, hours, start_time } = req.body;
      if (!user_id || !pc_id || !hours) {
        return res
          .status(400)
          .json({ error: "Missing fields: user_id, pc_id, hours" });
      }
      const hrs = Number(hours);
      if (!Number.isFinite(hrs) || hrs <= 0) {
        return res.status(400).json({ error: "Invalid hours" });
      }

      // беремо price (VARCHAR) з pcs
      const pcQ = await db.query(
        `SELECT pc_id, is_active, price FROM pcs WHERE pc_id=$1`,
        [pc_id]
      );
      if (pcQ.rowCount === 0)
        return res.status(404).json({ error: "PC not found" });
      const pc = pcQ.rows[0];
      if (!pc.is_active)
        return res.status(409).json({ error: "PC is not active" });

      const rate = extractRate(pc.price);
      if (!Number.isFinite(rate) || rate < 0) {
        return res.status(422).json({ error: "Invalid PCS price format" });
      }

      const start = start_time ? new Date(start_time) : new Date();
      const end = new Date(start.getTime());
      end.setHours(end.getHours() + hrs);

      // перевірка конфлікту часу
      const conflictQ = await db.query(
        `
        SELECT 1
        FROM bookings b
        WHERE b.pc_id = $1
          AND b.status = ANY($2)
          AND NOT ($3 >= b.end_time OR $4 <= b.start_time)
        LIMIT 1
        `,
        [pc_id, BLOCKING_STATUSES, start, end]
      );
      if (conflictQ.rowCount > 0) {
        return res
          .status(409)
          .json({ error: "PC already booked in this interval" });
      }

      const total = rate * hrs;

      const ins = await db.query(
        `
        INSERT INTO bookings (user_id, pc_id, start_time, end_time, status, price)
        VALUES ($1, $2, $3, $4, 'pending', $5)
        RETURNING booking_id, user_id, pc_id, start_time, end_time, status, price
        `,
        [user_id, pc_id, start, end, total]
      );

      res.json(ins.rows[0]);
    } catch (e) {
      console.error("bookings.create error:", e);
      res.status(500).json({ error: e.message });
    }
  }

  // GET /api/bookings/user/:user_id  (щоб не було undefined у роуті)
  async listByUser(req, res) {
    try {
      const { user_id } = req.params;
      const q = `
        SELECT b.booking_id, b.user_id, b.pc_id, p.label,
               b.start_time, b.end_time, b.status, b.price
        FROM bookings b
        JOIN pcs p ON p.pc_id = b.pc_id
        WHERE b.user_id = $1
        ORDER BY b.start_time DESC
      `;
      const r = await db.query(q, [user_id]);
      res.json(r.rows);
    } catch (e) {
      console.error("bookings.listByUser error:", e);
      res.status(500).json({ error: e.message });
    }
  }
}

module.exports = new BookingsController();
