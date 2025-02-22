import { ObjectId, PopulatedDoc } from 'mongoose';
import { IImage } from './image.types';
import { RolesEnum } from './role.types';

const roleCode = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    CONTRACTOR: 'CONTRACTOR',
    GOVERNMENT: 'GOVERNMENT',
} as const;

export type RoleCode = keyof typeof roleCode; // "ADMIN" | "USER" | "CONTRACTOR" | "GOVERNMENT"
export interface IUser extends Document {
    _id: ObjectId;
    id: string;
    name: string;
    phone: string;
    email: string;
    role: RoleCode;
    password?: string;
    photo?: PopulatedDoc<IImage>;
    isVerified: boolean;
    lastLogin?: Date;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    governmentId?: string;
    designation?: string;
    department?: string;
    contractorLicense?: string;
    contributions: number;
    experience: number;
    reputationScore?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMention {
    userId: string | ObjectId;
    name: string;
}

export interface IPostImage {
    url: string | null;
    alt: string;
}

export interface IPostComment {
    id?: string;
    ownerId: string | ObjectId;
    content: string;
    createdAt?: Date;
}

export interface IPost {
    _id: ObjectId;
    id: string;
    ownerId: string | ObjectId;
    title: string;
    content: string;
    password: string;
    isLocked: boolean;
    visibleTo: IMention[];
    images: PopulatedDoc<IImage>[];
    user: PopulatedDoc<IUser>;
    comments: IPostComment[] | [];
}

export interface IRequestUser {
    id: string;
    email: string;
    phone: string;
    name: string;
    // add enum for role
    role: RolesEnum;
    password: string;
}

export type RegisterUserPayload = Pick<
    IUser,
    'email' | 'name' | 'phone' | 'password' | 'role'
>;

export type UpdateUserPayload = Partial<Omit<IUser, 'id' | '_id' | 'photo'>> & {
    photo?: string;
};
