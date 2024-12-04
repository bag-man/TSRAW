import { AxiosError, AxiosRequestConfig } from 'axios'
import { axios, rq } from './utils.js'
import {
  TSRAWCredentials,
  OAuthResp,
  RedditRes,
  AboutResp,
  Comment,
  CommentsReq,
  CommentsResp,
  EditArgs,
  SettingsResp,
  SubmitArgs,
  SubmitResp,
  Thread,
  ThreadsReq,
  ThreadsResp
} from './types.js';

export class TSRAW {
  private rAxios

  constructor(token: string) {
    this.rAxios = axios.create({
      baseURL: 'https://oauth.reddit.com/api/',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer ' + token
      }
    })

    // TODO Work out why this.rAxios doesn't use the interceptor in utils
    this.rAxios.interceptors.response.use(undefined, (err: any) => {
      console.log(`rAxios: Failed request ${err.config.url}, ${err.code}, ${err.response.status}`)
      if (err.response.status >= 500 && err.config && !err.config.__isRetryRequest) {
        console.log(`Retrying...`)
        err.config.__isRetryRequest = true;
        return axios(err.config);
      }
      throw err;
    });
  }

  static async init(credentials: TSRAWCredentials): Promise<TSRAW> {
    const loginRequest = {
      url: 'https://www.reddit.com/api/v1/access_token',
      method: 'POST',
      auth: {
        username: credentials.client_id,
        password: credentials.client_secret
      },
      data: new URLSearchParams({
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password
      }),
      headers: {
        'User-Agent': credentials.user_agent,
        'content-type': 'application/x-www-form-urlencoded',
      }
    }

    const { access_token: token }: OAuthResp = await rq(loginRequest)
    return new TSRAW(token)
  }

  private async rq<T extends RedditRes>(request: AxiosRequestConfig, raw?: boolean): Promise<T> {
    const URI = this.rAxios.getUri({
      ...request,
      data: new URLSearchParams({ api_type: 'json', ...request.data })
    })

    try {
      const res = await this.rAxios({
        ...request,
        data: new URLSearchParams({ api_type: 'json', ...request.data })
      })

      if (res.data?.json?.errors.length) {
        throw new Error(`RedditError: ${res.data.json.errors}`)
      }

      return raw ? res : res.data.json
    } catch (cause) {
      if ((cause as Error).message.includes("RedditError")) {
        console.error(request.method, URI)
        console.error(request.data)
      }
      throw cause instanceof AxiosError ? cause.toJSON() : cause
    }
  }

  async submit (submission: SubmitArgs): Promise<SubmitResp> {
    return (this.rq<SubmitResp>({
      method: 'POST',
      url: 'submit',
      data:  submission,
    }))
  }

  async edit (post: EditArgs): Promise<SubmitResp> {
    return (this.rq<SubmitResp>({
      method: 'POST',
      url: 'editusertext',
      // Use t3 for self post, t1 for comment
      // https://www.reddit.com/dev/api/#fullnames
      data:  { text: post.text, thing_id: `t3_${post.id}` },
    }))
  }

  async sticky (id: string): Promise<RedditRes> {
    return this.rq({
      method: 'POST',
      url: 'set_subreddit_sticky',
      data:  {
        id,
        state: true,
      },
    })
  }

  async getSettings (subreddit: string): Promise<SettingsResp> {
    const url = `/r/${subreddit}/about/edit.json`

    return (await this.rq<SettingsResp>({
      baseURL: 'https://oauth.reddit.com',
      method: 'GET',
      url
    }, true))
  }

  async getMe (): Promise<AboutResp> {
    const url = `/api/me.json`

    return (await this.rq<AboutResp>({
      baseURL: 'https://oauth.reddit.com',
      method: 'GET',
      url
    }, true))
  }

  async updateSidebar (subreddit: string, description: string) {
    const oldSettings = (await this.getSettings(subreddit)).data.data
    const newDescription = oldSettings.description.split('# Schedule')[0] + description
    return this.rq({
      method: 'POST',
      url: 'site_admin',
      data:  {
        sr: oldSettings.subreddit_id,
        link_type: 'any',
        type: 'public',
        ...oldSettings,
        description: newDescription
      },
    })
  }

  async threads (params: ThreadsReq): Promise<Thread[]> {
    const { subreddit, sort = 'new', time = 'day', after, limit = 100 } = params
    let url

    if (!after) {
      url = `https://oauth.reddit.com/r/${subreddit}/${sort}/.json?limit=${limit}&t=${time}`
    } else {
      url = `https://oauth.reddit.com/r/${subreddit}/${sort}/.json?limit=${limit}&t=${time}&after=${after}`
    }

    const res = (await this.rq<ThreadsResp>({
      method: 'GET',
      url
    }, true))

    return res.data.data.children
  }

  async comments (params: CommentsReq): Promise<Comment[]> {
    const { thread_id, sort = 'new', limit = 100, after  } = params
    let url

    if (!after) {
      url = `https://oauth.reddit.com/comments/${thread_id}.json?limit=${limit}&sort=${sort}`
    } else {
      url = `https://oauth.reddit.com/comments/${thread_id}.json?limit=${limit}&sort=${sort}&after=${after}`
    }

    const res = await this.rq<CommentsResp>({ method: 'GET', url }, true)

    return res.data[1].data.children
  }
}

module.exports = TSRAW
