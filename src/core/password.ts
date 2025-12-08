import bcrypt from 'bcrypt';

export class PasswordUtils {
    private static readonly saltRounds = 12;

    static async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    static async compare(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
