const connection = (req) => new Promise((resolve, reject) => {
    req.getConnection((err, conn) => {
        err ? reject(err) : resolve(conn);
    }) 
})

const query = (qr, conn) => new Promise((resolve, reject) => {
    conn.query(qr, (err, results) => {
        err ? reject(err) : resolve(results);
    })
})

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