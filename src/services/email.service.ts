interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
    from?: string;
}

/**
 * Service for sending emails
 */
const sendMail = async (options: EmailOptions): Promise<void> => {
    try {
        // Get email configuration from environment variables
        const fromEmail =
            options.from || process.env.EMAIL_FROM || 'noreply@proact.com';

        // For development, log the email
        if (process.env.NODE_ENV !== 'production') {
            console.log('====== EMAIL WOULD BE SENT =====');
            console.log('From:', fromEmail);
            console.log('To:', options.to);
            console.log('Subject:', options.subject);
            console.log('Text:', options.text);
            if (options.html) console.log('HTML:', options.html);
            console.log('===============================');
            return;
        }

        // Implementation with preferred email provider
        // Uncomment and use one of the following implementations:

        /* NODEMAILER IMPLEMENTATION
        const nodemailer = require('nodemailer');
        
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: fromEmail,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
        */

        /* SENDGRID IMPLEMENTATION
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        await sgMail.send({
            from: fromEmail,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });
        */

        /* AWS SES IMPLEMENTATION 
        const AWS = require('aws-sdk');
        const SES = new AWS.SES({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
        
        await SES.sendEmail({
            Source: fromEmail,
            Destination: { ToAddresses: [options.to] },
            Message: {
                Subject: { Data: options.subject },
                Body: {
                    Text: { Data: options.text },
                    ...(options.html && { Html: { Data: options.html } })
                }
            }
        }).promise();
        */
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send email');
    }
};

/**
 * Sends an email verification link to the user
 */
const sendEmailVerification = async (
    email: string,
    token: string,
    frontendUrl: string
): Promise<void> => {
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}&email=${email}`;

    await sendMail({
        to: email,
        subject: 'Verify your email address',
        text: `Please click the following link to verify your email address: ${verificationUrl}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Email Verification</h2>
                <p>Hello,</p>
                <p>Please click the button below to verify your email address.</p>
                <div style="margin: 20px 0;">
                    <a href="${verificationUrl}" 
                       style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                              text-decoration: none; border-radius: 5px; font-weight: bold;">
                        Verify Email
                    </a>
                </div>
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p>${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br>The Proact Team</p>
            </div>
        `,
    });
};

export default {
    sendMail,
    sendEmailVerification,
};
