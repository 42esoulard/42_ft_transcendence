import { DefaultApi } from "sdk-client";

export default {
  install: (app: any, config: any) => {
    const api: any = new DefaultApi(config);
    app.config.globalProperties.$api = api || {};
    app.provide('api', api);
  }
}

// export function getApi() {  
//     const api = inject(apiSymbol); 
//     if (!api) throw new Error('No api provided!');

//     return api;
// }