import { _decorator, Component } from 'cc';
import { initHttpClient, httpClient } from '../net/HttpClient';
const { ccclass } = _decorator;

interface PetAppearance {
    bodyType: string;
    colorPrimary: string;
    colorSecondary: string;
    description: string;
    patternType: string;
}

interface PetPersonality {
    activity: number;
    appetite: number;
    curiosity: number;
    description: string;
    social: number;
}

interface PetSkill {
    description: string;
    level: number;
    name: string;
    rarity: string;
}

interface PetStatus {
    cleanliness: number;
    energy: number;
    happiness: number;
    hunger: number;
    isDirty: boolean;
    isHungry: boolean;
    isTired: boolean;
    isUnhappy: boolean;
}

interface PetStatusDelta extends PetStatus {
    revision: number;
    serverTime: string;
    statusUpdatedAt: string;
}

interface PetData {
    appearance: PetAppearance;
    exp: number;
    expToNext: number;
    geneCode: string;
    id: number;
    level: number;
    name: string;
    personality: PetPersonality;
    skill: PetSkill;
    stage: string;
    status: PetStatus & Partial<Pick<PetStatusDelta, 'revision' | 'serverTime' | 'statusUpdatedAt'>>;
}

@ccclass('MainController')
export class MainController extends Component {
    private static readonly STATUS_POLL_INTERVAL_SECONDS = 15;

    private petData: PetData | null = null;
    private isPollingStatus = false;

    protected async onLoad() {
        await this.initAndLoadPetData();
    }

    protected onDestroy() {
        this.unschedule(this.pollPetStatus);
    }

    public getPetData() {
        return this.petData;
    }

    private async initAndLoadPetData() {
        try {
            await this.fetchFullPetData();
            this.startStatusPolling();
        } catch (error) {
            console.error('[MainController] 初始化宠物数据失败', error);
        }
    }

    private async fetchFullPetData() {
        const response = await httpClient.get<PetData>('/pet');
        if (response.code !== 0 || !response.data) {
            throw new Error(response.message || '获取宠物全量数据失败');
        }
        this.petData = response.data;
    }

    private startStatusPolling() {
        this.unschedule(this.pollPetStatus);
        this.schedule(this.pollPetStatus, MainController.STATUS_POLL_INTERVAL_SECONDS);
    }

    private pollPetStatus = async () => {
        if (this.isPollingStatus || !this.petData) {
            return;
        }

        this.isPollingStatus = true;
        try {
            const response = await httpClient.get<PetStatusDelta>('/pet/status');
            if (response.code !== 0 || !response.data) {
                throw new Error(response.message || '获取宠物状态失败');
            }

            this.petData = {
                ...this.petData,
                status: {
                    ...this.petData.status,
                    ...response.data,
                },
            };
        } catch (error) {
            console.warn('[MainController] 拉取宠物状态失败', error);
        } finally {
            this.isPollingStatus = false;
        }
    };
}

