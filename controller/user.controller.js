const db = require("../db");
class UserController {
  async createUser(req, res) {
    const { email, password_hash, full_name, phone } = req.body;
    const newPerson = await db.query(
      `INSERT INTO users (email, password_hash, full_name, phone) values ($1, $2, $3, $4) RETURNING *`,
      [email, password_hash, full_name, phone]
    );
    console.log(newPerson);
    res.json(newPerson.rows[0]);
  }
  async getUser(req, res) {
    const user = await db.query(`SELECT * FROM users`);
    res.json(user.rows);
  }

  async getOneUser(req, res) {
    const user_id = req.params.user_id;
    const user = await db.query(`SELECT * FROM users where id = $1`, [user_id]);
    res.json(user.rows);
  }

  async updateUser(req, res) {
    const { user_id, email, password_hash, full_name, phone } = req.body;
    const user = await db.query(
      `UPDATE users set email = $2, password_hash = $3, full_name = $4, phone = $5 where user_id = $1 RETURNING *`,
      [user_id, email, password_hash, full_name, phone]
    );
    res.json(user.rows[0]);
  }
  async deleteUser(req, res) {
    const user_id = req.params.user_id;
    const user = await db.query(`DELETE FROM users where user_id = $1`, [
      user_id,
    ]);
    res.json(user.rows[0]);
  }
}

module.exports = new UserController(); //створює об'єкт класу
