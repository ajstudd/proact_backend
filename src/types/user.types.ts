import { ObjectId, PopulatedDoc } from 'mongoose';
import { IImage } from './image.types';
import { RolesEnum } from './role.types';

export interface IUser {
    _id: ObjectId;
    id: string;
    phone: string;
    score: number;
    lastCheckIn: Date;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
    password?: string;
    photo?: PopulatedDoc<IImage>;
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
    password: string;
}

export type RegisterUserPayload = Pick<
    IUser,
    'email' | 'name' | 'phone' | 'password'
>;

export type UpdateUserPayload = Partial<Omit<IUser, 'id' | '_id' | 'photo'>> & {
    photo?: string;
};
