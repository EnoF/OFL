module.exports = {

    mysql: {
        host: process.env.LOCAL_HOST,
        user: process.env.DB_FOOSBALL_USER,
        password: process.env.DB_FOOSBALL_USER_PW,
        database: process.env.DB_SCHEMA
    }

}