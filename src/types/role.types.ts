const roleCode = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    CONTRACTOR: 'CONTRACTOR',
    GOVERNMENT: 'GOVERNMENT',
} as const;

// export type RoleCode = keyof typeof roleCode; // "ADMIN" | "USER" | "CONTRACTOR" | "GOVERNMENT"

// export type RolesEnum = RoleCode;

// export interface IRole {
//     [key: string]: RolesEnum;
// }

export interface IRoleFromRoles {
    ADMIN: '';
    USER: '';
    CONTRACTOR: '';
    GOVERNMENT: '';
}
