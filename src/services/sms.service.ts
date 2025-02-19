import { sendMessage } from '@/utils/sendMessage';

const sendOtpSms = async (phone: string, otp: string) => {
    return await sendMessage(`Your OTP is: ${otp}`, phone);
};

const sendQuoteSms = async (phone: string, data: any) => {
    try {
        const message = `
        Order review details:
        Order ID: ${data.orderId}
        Estimated Amount: $${data.amount}
        Discount: ${data.discount}%
        Expected Delivery Date: ${new Date(
            data.deliveryDate
        ).toLocaleDateString('en-US')}
        Note: ${data.note}
        We kindly request you to click on the following link to proceed with the payment: ${
            data.paymentLink
        }
      `;
        const response = await sendMessage(message, phone);
        return response;
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};

export default {
    sendOtpSms,
    sendQuoteSms,
};
