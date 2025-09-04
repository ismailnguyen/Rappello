if (process.env.NODE_ENV !== 'production') {
    const dotenv = require('dotenv');
    dotenv.config();
}

module.exports = {
    EXPEDITOR_EMAIL: process.env.EXPEDITOR_EMAIL,
    EXPEDITOR_PASSWORD: process.env.EXPEDITOR_PASSWORD,
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
    API_KEY: process.env.API_KEY,

    PORT: parseInt(process.env.PORT) || 3000
}
