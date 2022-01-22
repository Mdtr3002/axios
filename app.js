import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});
function getLocalAccessToken() {
  const accessToken = window.localStorage.getItem('accessToken');
  return accessToken;
}
function getLocalRefreshToken() {
  const refreshToken = window.localStorage.getItem('refreshToken');
  return refreshToken;
}
instance.interceptors.request.use(
  (config) => {
    const token = getLocalAccessToken();
    if (token) {
      // config.headers["Authorization"] = 'Bearer ' + token;  // for Spring Boot back-end
      // eslint-disable-next-line no-param-reassign
      config.headers['x-access-token'] = token; // for Node.js Express back-end
    }
    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;

    if (originalConfig.url !== '/api/private' && err.response) {
      // Access Token was expired
      // eslint-disable-next-line no-underscore-dangle
      if (err.response.status === 401 && !originalConfig._retry) {
        // eslint-disable-next-line no-underscore-dangle
        originalConfig._retry = true;

        try {
          const rs = await instance.post('/api/token/refresh', {
            refreshToken: getLocalRefreshToken(),
          });

          const { accessToken } = rs.data;
          window.localStorage.setItem('accessToken', accessToken);
          instance.defaults.headers.common['x-access-token'] = accessToken;

          return instance(originalConfig);
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }

    return Promise.reject(err);
  },
);

export default instance;
