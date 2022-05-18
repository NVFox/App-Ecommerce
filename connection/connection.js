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

const queryWithParams = (qr, params, conn) => new Promise((resolve, reject) => {
    conn.query(qr, params, (err, results) => {
        err ? reject(err) : resolve(results);
    })
})

module.exports = { 
    connection: connection,
    query: query,
    queryWithParams: queryWithParams
}