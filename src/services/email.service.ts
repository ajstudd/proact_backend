import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
    from?: string;
}

let transporter: nodemailer.Transporter;

/**
 * Initializes the email service with nodemailer transporter
 */
const init = async (): Promise<void> => {
    try {
        transporter = nodemailer.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: Number(process.env.NODEMAILER_PORT),
            secure: JSON.parse(process.env.NODEMAILER_SECURE ?? 'false'),
            requireTLS: JSON.parse(
                process.env.NODEMAILER_REQUIRE_TLS ?? 'false'
            ),
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASSWORD,
            },
        });

        // Verify the connection
        await transporter.verify();
        console.log('Email service initialized successfully');
    } catch (error) {
        console.error('Failed to initialize email transporter:', error);
        throw new Error('Email service initialization failed');
    }
};

/**
 * Service for sending emails
 */
const sendMail = async (options: EmailOptions): Promise<void> => {
    try {
        // Ensure transporter is initialized
        if (!transporter) {
            console.log(
                'Email transporter not initialized, initializing now...'
            );
            await init();
        }

        // Get email configuration from environment variables
        const fromEmail =
            options.from || process.env.NODEMAILER_FROM || 'noreply@proact.com';

        // Log the email being sent
        console.log(
            `Sending email to: ${options.to}, subject: ${options.subject}`
        );

        // Send email using nodemailer
        const info = await transporter.sendMail({
            from: fromEmail,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        });

        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Email sending failed:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to send email: ${error.message}`);
        } else {
            throw new Error('Failed to send email: Unknown error');
        }
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
    init,
    sendMail,
    sendEmailVerification,
};
