import { DefaultApi, UserApi, AuthApi, PongApi } from "@/../sdk/typescript-axios-client-generated"
import { GamepadCircle } from "mdue";
import { inject } from "vue";

export default {
  install: (app: any) => {
    const defaultApi: DefaultApi = new DefaultApi();
    const userApi: UserApi = new UserApi();
    const authApi: AuthApi = new AuthApi();
    const pongApi: PongApi = new PongApi();
    app.config.globalProperties.$defaultApi = defaultApi || {};
    app.config.globalProperties.$userApi = userApi || {};
    app.config.globalProperties.$authApi = authApi || {};
    app.config.globalProperties.$pongApi = pongApi || {};
    app.provide('defaultApi', defaultApi);
    app.provide('userApi', userApi);
    app.provide('authApi', authApi);
    app.provide('pongApi', pongApi);
  }
}

export function useDefaultApi(): DefaultApi {
  const api = inject('defaultApi') as DefaultApi;
  if (!api) throw new Error('No api provided!');

  return api;
}
export function usePongApi(): PongApi {
  const api = inject('pongApi') as PongApi;
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
