import sql from 'mssql'

const config = {
    user: "sa",
    password: "123",
    server: "DESKTOP-KAMK65Q",
    database: "relationApp",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
console.log(poolPromise.connect());

export {sql, poolPromise};