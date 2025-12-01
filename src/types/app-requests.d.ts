import { Request } from 'express';

// 8 hajar me rust me kaam nhi karunga

declare interface ProtectedRequest extends Request {
    user: User;
    accessToken: string;
    // keystore: Keystore;
}

declare interface Tokens {
    accessToken: string;
    refreshToken: string;
}
