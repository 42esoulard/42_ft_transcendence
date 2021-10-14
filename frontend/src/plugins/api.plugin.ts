import { DefaultApi, UserApi, AuthApi } from "@/../sdk/typescript-axios-client-generated"
import { inject } from "vue";

export default {
  install: (app: any) => {
    const defaultApi: DefaultApi = new DefaultApi();
    const userApi: UserApi = new UserApi();
    const authApi: AuthApi = new AuthApi();
    app.config.globalProperties.$defaultApi = defaultApi || {};
    app.config.globalProperties.$userApi = userApi || {};
    app.config.globalProperties.$authApi = authApi || {};
    app.provide('defaultApi', defaultApi);
    app.provide('userApi', userApi);
    app.provide('authApi', authApi);
  }
}

export function useDefaultApi(): DefaultApi {
  const api = inject('defaultApi') as DefaultApi;
  if (!api) throw new Error('No api provided!');

  return api;
}
export function useUserApi(): UserApi {
  const api = inject('userApi') as UserApi;
  if (!api) throw new Error('No api provided!');

  return api;
}
export function useAuthApi(): AuthApi {
  const api = inject('authApi') as AuthApi;
  if (!api) throw new Error('No api provided!');

  return api;
}