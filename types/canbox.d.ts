// 定义 window 上的 API 类型（新架构，通过 contextBridge 暴露）
export {}; // 确保文件被识别为模块
declare global {
    interface Window {
        /**
         * 缩放 API
         */
        zoomAPI: {
            getZoom: () => Promise<number>;
            saveZoom: (zoom: number) => Promise<void>;
        };

        /**
         * 路由持久化 API
         */
        routeAPI: {
            getRoute: () => Promise<string>;
            saveRoute: (route: string) => Promise<void>;
        };

        /**
         * 语言持久化 API
         */
        languageAPI: {
            getLanguage: () => Promise<string>;
            saveLanguage: (language: string) => Promise<void>;
        };
    }
}
