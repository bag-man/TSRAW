import { AxiosRequestConfig, AxiosError } from "axios"

export const axios = require('axios');

axios.interceptors.response.use(undefined, (err: any) => {
  console.log(`axios: Failed request ${err.config.url}, ${err.code}, ${err.response?.status}`)
  if (err.response.status >= 500 && err.config && !err.config.__isRetryRequest) {
    console.log(`Retrying...`)
    err.config.__isRetryRequest = true;
    return axios(err.config);
  }
  throw err;
});

export const rq = async (request: AxiosRequestConfig) => {
  try {
    const res = await axios(request)
    return res.data
  } catch (cause) {
    if (cause instanceof AxiosError) {
      console.error(cause.toJSON())
    } else {
      console.error(cause)
    }
  }
}

export const sleep = async (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000))
