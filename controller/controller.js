const { connection, query } = require("../connection/connection");

module.exports = {
    renderLogin: (_req, res) => {
        res.render("index");
    },
    consultarTodosUsuarios: async (req, res) => {
        try {
            const conn = await connection(req);
            const results = await query("SELECT * FROM usuarios", conn);
            res.json(results);
        } catch (err) {
            console.log(err);
        }
    }
}