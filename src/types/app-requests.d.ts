import { Request } from 'express';

interface User {
    parentId: number;
}
declare interface ProtectedRequest extends Request {
    user: User;
}

export { ProtectedRequest, User };
