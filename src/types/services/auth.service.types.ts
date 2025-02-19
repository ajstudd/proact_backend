import { IUser } from '../user.types';

type LoginEmailPayload = Pick<IUser, 'email'>;
type LoginPhonePayload = Pick<IUser, 'phone'>;

export interface LoginPayload {
    email?: string;
    phone?: string;
    password?: string;
}

export type VerifyOtpPayload = LoginPayload & { otp: string };
