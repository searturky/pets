import { director } from 'cc';
import { UserManager } from '../core/UserManager';
import { ApiResponse } from './ApiResponse';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
    baseUrl?: string;
    headers?: Record<string, string>;
    timeoutMs?: number;
}

export interface RequestConfig extends RequestOptions {
    method?: HttpMethod;
    query?: Record<string, string | number | boolean | null | undefined>;
    body?: unknown;
}

export class Http {
    private baseUrl: string;
    private headers: Record<string, string>;
    private timeoutMs: number;

    constructor(options: RequestOptions = {}) {
        this.baseUrl = options.baseUrl ?? '';
        this.headers = options.headers ?? {};
        this.timeoutMs = options.timeoutMs ?? 10000;
    }

    setBaseUrl(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    setHeader(key: string, value: string) {
        this.headers[key] = value;
    }

    setAuthToken(token: string | null) {
        if (!token) {
            delete this.headers['Authorization'];
            return;
        }
        this.headers['Authorization'] = `Bearer ${token}`;
    }

    async get<T>(path: string, query?: RequestConfig['query'], options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(path, { method: 'GET', query, ...options });
    }

    async post<T>(path: string, body?: RequestConfig['body'], options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(path, { method: 'POST', body, ...options });
    }

    async put<T>(path: string, body?: RequestConfig['body'], options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(path, { method: 'PUT', body, ...options });
    }

    async patch<T>(path: string, body?: RequestConfig['body'], options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(path, { method: 'PATCH', body, ...options });
    }

    async delete<T>(path: string, query?: RequestConfig['query'], options?: RequestOptions): Promise<ApiResponse<T>> {
        return this.request<T>(path, { method: 'DELETE', query, ...options });
    }

    async request<T>(path: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
        const method = config.method ?? 'GET';
        const baseUrl = config.baseUrl ?? this.baseUrl;
        const timeoutMs = config.timeoutMs ?? this.timeoutMs;
        const headers = { ...this.headers, ...config.headers };

        const url = this.buildUrl(baseUrl, path, config.query);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const res = await fetch(url, {
                method,
                headers: this.buildHeaders(headers, config.body),
                body: this.buildBody(config.body),
                signal: controller.signal,
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const data = (await res.json()) as ApiResponse<T>;
                if (data && (data.code === 401 || data.code === 403)) {
                    this.handleAuthExpired();
                }
                return data;
            }
            throw new Error('HTTP response is not JSON');
        } finally {
            clearTimeout(timer);
        }
    }

    private handleAuthExpired() {
        UserManager.getInstance().clear();
        this.setAuthToken(null);
        director.loadScene('login.scene');
    }

    private buildUrl(baseUrl: string, path: string, query?: RequestConfig['query']) {
        const normalizedBase = baseUrl.replace(/\/+$/, '');
        const normalizedPath = path.replace(/^\/+/, '');
        const url = normalizedBase ? `${normalizedBase}/${normalizedPath}` : normalizedPath;

        if (!query) {
            return url;
        }

        const params = new URLSearchParams();
        for (const key in query) {
            if (!Object.prototype.hasOwnProperty.call(query, key)) {
                continue;
            }
            const value = query[key];
            if (value === null || value === undefined) {
                continue;
            }
            params.append(key, String(value));
        }

        const queryString = params.toString();
        if (!queryString) {
            return url;
        }
        return url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
    }

    private buildHeaders(headers: Record<string, string>, body: RequestConfig['body']) {
        if (!body) {
            return headers;
        }
        if (headers['Content-Type']) {
            return headers;
        }
        return { ...headers, 'Content-Type': 'application/json' };
    }

    private buildBody(body: RequestConfig['body']) {
        if (body === undefined || body === null) {
            return undefined;
        }
        if (body instanceof FormData || typeof body === 'string') {
            return body;
        }
        return JSON.stringify(body);
    }
}
