import type { Response } from 'express';

enum ResponseStatus {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500,
    CREATED = 201,
    RESOURCE_CONFLICT = 409,
    NO_CONTENT = 204,
}

abstract class ApiResponse {
    constructor(
        protected status: ResponseStatus,
        protected message: string,
    ) {}

    protected prepare<T extends ApiResponse>(
        res: Response,
        response: T,
        headers: { [key: string]: string },
    ): Response {
        for (const [key, value] of Object.entries(headers))
            res.append(key, value);
        return res.status(this.status).json(ApiResponse.sanitize(response));
    }

    public send(
        res: Response,
        headers: { [key: string]: string } = {},
    ): Response {
        return this.prepare<ApiResponse>(res, this, headers);
    }

    private static sanitize<T extends ApiResponse>(response: T): T {
        const clone: T = {} as T;
        Object.assign(clone, response);
        // @ts-expect-error: optional
        delete clone.status;
        for (const i in clone)
            if (typeof clone[i] === 'undefined') delete clone[i];
        return clone;
    }
}

export class AuthFailureResponse extends ApiResponse {
    constructor(message = 'Authentication Failure') {
        super(ResponseStatus.UNAUTHORIZED, message);
    }
}

export class NotFoundResponse extends ApiResponse {
    constructor(message = 'Not Found') {
        super(ResponseStatus.NOT_FOUND, message);
    }

    send(res: Response, headers: { [key: string]: string } = {}): Response {
        return super.prepare<NotFoundResponse>(res, this, headers);
    }
}

export class ForbiddenResponse extends ApiResponse {
    constructor(message = 'Forbidden') {
        super(ResponseStatus.FORBIDDEN, message);
    }
}

export class BadRequestResponse extends ApiResponse {
    constructor(message = 'Bad Parameters') {
        super(ResponseStatus.BAD_REQUEST, message);
    }
}

export class InternalErrorResponse extends ApiResponse {
    constructor(message = 'Internal Error') {
        super(ResponseStatus.INTERNAL_ERROR, message);
    }
}

export class SuccessMsgResponse extends ApiResponse {
    constructor(message: string) {
        super(ResponseStatus.SUCCESS, message);
    }
}

export class FailureMsgResponse extends ApiResponse {
    constructor(message: string) {
        super(ResponseStatus.SUCCESS, message);
    }
}

export class SuccessResponse<T> extends ApiResponse {
    constructor(
        message: string,
        private data: T,
    ) {
        super(ResponseStatus.SUCCESS, message);
    }

    send(res: Response, headers: { [key: string]: string } = {}): Response {
        return super.prepare<SuccessResponse<T>>(res, this, headers);
    }
}

export class AccessTokenErrorResponse extends ApiResponse {
    private instruction = 'refresh_token';

    constructor(message = 'Access token invalid') {
        super(ResponseStatus.UNAUTHORIZED, message);
    }

    send(res: Response, headers: { [key: string]: string } = {}): Response {
        headers.instruction = this.instruction;
        return super.prepare<AccessTokenErrorResponse>(res, this, headers);
    }
}

export class TokenRefreshResponse extends ApiResponse {
    constructor(
        message: string,
        private accessToken: string,
        private refreshToken: string,
    ) {
        super(ResponseStatus.SUCCESS, message);
    }

    send(res: Response, headers: { [key: string]: string } = {}): Response {
        return super.prepare<TokenRefreshResponse>(res, this, headers);
    }
}
