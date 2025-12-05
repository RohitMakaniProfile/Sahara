import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      parentId: number;
      email?: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}
