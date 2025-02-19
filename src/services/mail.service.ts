import { object } from 'joi';
import nodemailer from 'nodemailer';

let trnasporter: nodemailer.Transporter;

const sendOtpMail = (to: string, otp: string) => {
    const template = [`Your OTP is: ${otp}`].join('\n');

    return trnasporter.sendMail({
        from: process.env.NODEMAILER_FROM,
        to,
        subject: `intelligram OTP`,
        text: template,
    });
};

const sendQuoteMail = (to: string, data: any) => {
    const template = `
Hello,

We are excited to provide you with a quote for your order with Order ID: ${
        data.orderId
    }.
Please find the details below:

- Estimated Amount: $${data.amount}
- Discount: ${data.discount}%
- Expected Delivery Date: ${new Date(data.deliveryDate).toLocaleDateString(
        'en-US'
    )}
- Note: ${data.note}
- We kindly request you to click on the following link to proceed with the payment: ${
        data.paymentLink
    }

Thank you for choosing us for your order. If you have any questions or need further assistance, please feel free to contact us.

Best regards,
intelligram
`;

    return trnasporter.sendMail({
        from: process.env.NODEMAILER_FROM,
        to,
        subject: `Quote for Order ID: ${data.orderId}`,
        text: template,
    });
};

//from 2024, less secure apps will not be able to access gmail, which just used email and password to login
//so, we need to use OAuth2.0 to login to gmail
// I have used app password to login to gmail
const init = () => {
    trnasporter = nodemailer.createTransport({
        host: process.env.NODEMAILER_HOST,
        port: Number(process.env.NODEMAILER_PORT),
        secure: JSON.parse(process.env.NODEMAILER_SECURE ?? 'false'),
        requireTLS: JSON.parse(process.env.NODEMAILER_REQUIRE_TLS ?? 'false'),
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASSWORD,
        },
    });
};

export default {
    sendOtpMail,
    sendQuoteMail,
    init,
};
