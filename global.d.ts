import { GetPublicKeyOrSecret, Secret } from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            PORT: string;
            MONGO_URL: string;
            JWT_TOKEN_SECRET: Secret | GetPublicKeyOrSecret;
            JWT_TOKEN_EXPIRES_IN: string;

            TWILIO_ACCOUNT_SID: string;
            TWILIO_AUTH_TOKEN: string;
            TWILIO_MESSAGE_SERVICE_ID: string;

            NODEMAILER_HOST: string;
            NODEMAILER_PORT: string;
            NODEMAILER_SECURE: string;
            NODEMAILER_REQUIRE_TLS: string;
            NODEMAILER_USER: string;
            NODEMAILER_PASSWORD: string;
            NODEMAILER_FROM: string;

            TEST_ADMIN_EMAIL: string;
            TEST_ADMIN_PASSWORD: string;
        }
    }
}
