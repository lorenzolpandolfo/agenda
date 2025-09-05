let currentToken: string | null = null;
let currentUserData: any = null;

export interface AuthData {
    access_token: string;
    refresh_token: string;
    user_data: {
        id: string;
        name: string;
        email: string;
        role: string;
        status: string;
        crp?: string | null;
        image_url?: string | null;
    };
}

export class AuthService {
    static async saveAuthData(data: AuthData): Promise<void> {
        try {
            currentToken = data.access_token;
            currentUserData = data.user_data;
        } catch (error) {
            throw error;
        }
    }

    static async getToken(): Promise<string | null> {
        return currentToken;
    }

    static async getUserData(): Promise<any | null> {
        return currentUserData;
    }

    static async isAuthenticated(): Promise<boolean> {
        return !!currentToken;
    }

    static async logout(): Promise<void> {
        try {
            currentToken = null;
            currentUserData = null;
        } catch (error) {
            throw error;
        }
    }

    static async refreshToken(): Promise<string | null> {
        return currentToken;
    }
} 