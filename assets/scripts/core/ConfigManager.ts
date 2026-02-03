import { resources, JsonAsset } from 'cc';

export interface EnvConfig {
    env: string;
    apiHost: string;
    apiV1: string;
    apiV2: string;
}

const DEFAULT_ENV: EnvConfig = {
    env: 'dev',
    apiHost: 'http://localhost:8080',
    apiV1: '/api/v1',
    apiV2: '/api/v2',
};

export class ConfigManager {
    private static _instance: ConfigManager | null = null;
    private _env: EnvConfig | null = null;

    static getInstance() {
        if (!this._instance) {
            this._instance = new ConfigManager();
        }
        return this._instance;
    }

    async load(): Promise<EnvConfig> {
        if (this._env) {
            return this._env;
        }

        return new Promise<EnvConfig>((resolve, reject) => {
            resources.load('config/env', JsonAsset, (err, asset) => {
                if (err || !asset) {
                    console.warn('加载 env.json 失败，使用默认配置', err);
                    this._env = { ...DEFAULT_ENV };
                    resolve(this._env);
                    return;
                }

                const json = asset.json as Partial<EnvConfig>;
                this._env = {
                    env: json.env ?? DEFAULT_ENV.env,
                    apiHost: json.apiHost ?? DEFAULT_ENV.apiHost,
                    apiV1: json.apiV1 ?? DEFAULT_ENV.apiV1,
                    apiV2: json.apiV2 ?? DEFAULT_ENV.apiV2,
                };
                resolve(this._env);
            });
        });
    }

    getEnvSync(): EnvConfig {
        return this._env ?? DEFAULT_ENV;
    }

    getApiBaseUrl(version: 'v1' | 'v2'): string {
        const env = this.getEnvSync();
        const suffix = version === 'v2' ? env.apiV2 : env.apiV1;
        return `${env.apiHost}${suffix}`;
    }
}
