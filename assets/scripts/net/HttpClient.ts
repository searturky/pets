import { Http } from './Http';
import { ConfigManager } from '../core/ConfigManager';

export const httpClient = new Http({
    baseUrl: ConfigManager.getInstance().getApiBaseUrl('v1'),
    timeoutMs: 10000,
});

export async function initHttpClient() {
    const env = await ConfigManager.getInstance().load();
    httpClient.setBaseUrl(`${env.apiHost}${env.apiV1}`);
}

export const httpV2 = {
    get<T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
        return httpClient.get<T>(path, query, { baseUrl: ConfigManager.getInstance().getApiBaseUrl('v2') });
    },
    post<T>(path: string, body?: unknown) {
        return httpClient.post<T>(path, body, { baseUrl: ConfigManager.getInstance().getApiBaseUrl('v2') });
    },
    put<T>(path: string, body?: unknown) {
        return httpClient.put<T>(path, body, { baseUrl: ConfigManager.getInstance().getApiBaseUrl('v2') });
    },
    patch<T>(path: string, body?: unknown) {
        return httpClient.patch<T>(path, body, { baseUrl: ConfigManager.getInstance().getApiBaseUrl('v2') });
    },
    delete<T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
        return httpClient.delete<T>(path, query, { baseUrl: ConfigManager.getInstance().getApiBaseUrl('v2') });
    },
};
