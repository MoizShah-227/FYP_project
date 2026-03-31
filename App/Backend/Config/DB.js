import sql from 'mssql'

const config = {
    user: "sa",
    password: "123",
    server: "HP",
    database: "relationApp2",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
console.log("connected",poolPromise.connect());

export {sql, poolPromise};