export interface IComment {
    ownerId: string;
    postid: string;
    content: string;
    images: string[];
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IImage {
    image: string;
    localPath: string;
    _id?: string;
}
