import { sys } from 'cc';

const AUTH_TOKEN_KEY = 'AUTH_TOKEN';

export interface UserInfo {
    id: number;
    nickname: string;
    avatarUrl: string;
    coins: number;
    diamonds: number;
}

export class UserManager {
    private static instance: UserManager | null = null;
    private token: string | null = null;
    private userInfo: UserInfo | null = null;

    static getInstance() {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    setAuth(token: string) {
        this.token = token;
        sys.localStorage.setItem(AUTH_TOKEN_KEY, token);
    }

    getToken() {
        return this.token;
    }

    getUserInfo() {
        return this.userInfo;
    }

    setUserInfo(userInfo: UserInfo) {
        this.userInfo = userInfo;
    }

    loadFromStorage() {
        const token = sys.localStorage.getItem(AUTH_TOKEN_KEY);
        this.token = token && token.length > 0 ? token : null;
        return this.token;
    }

    clear() {
        this.token = null;
        this.userInfo = null;
        sys.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
}
