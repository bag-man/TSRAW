import { Axios, AxiosRequestConfig } from 'axios'

export class TSRAW {
  private rAxios: Axios

  constructor(token: string)

  static init(credentials: TSRAWCredentials): Promise<TSRAW>

  private rq<T extends RedditRes>(request: AxiosRequestConfig, raw?: boolean): Promise<T>

  submit (submission: SubmitArgs): Promise<SubmitResp>

  edit (post: EditArgs): Promise<SubmitResp>

  sticky (id: string): Promise<RedditRes>

  getSettings (subreddit: string): Promise<SettingsResp>

  getMe (): Promise<AboutResp>

  updateSidebar (subreddit: string, description: string): Promise<RedditRes>

  threads (params: ThreadsReq): Promise<Thread[]>

  comments (params: CommentsReq): Promise<Comment[]>
}

export type TSRAWCredentials = {
  user_agent: string
  client_id: string
  client_secret: string
  password: string
  username: string
}

export interface OAuthResp {
  access_token: string,
  token_type: string,
  expires_in: number,
  scope: string
}

export interface RedditRes {
  errors: string[]
}

export type SubmitArgs = {
  kind: 'link' | 'self' | 'image' | 'video' | 'videogif'
  sendreplies: boolean
  sr: string
  title: string
  text?: string
  url?: string
}

export type EditArgs = {
  text: string
  id: string
}

export interface SettingsResp extends RedditRes {
  data: {
    id: string
    data: {
      description: string
      subreddit_id: string
    }
  }
}

export interface AboutResp {
  kind: "t2",
  data: {
    modhash: string
  }
  errors: string[]
}

export interface SubmitResp extends RedditRes {
  data: {
    id: string
    name: string
    url: string
  }
}

export interface ThreadsReq {
  limit?: number,
  sort?: 'new' | 'hot' | 'rising' | 'controversial' | 'top'
  time?: 'hour' | 'day' | 'week' | 'month' | 'all'
  subreddit: string
  after?: string
}

export interface ThreadsResp {
  errors: string[]
  data: {
    kind: 'Listing'
    data: {
      before: null | string
      after: string
      dist: number
      children: Thread[]
    }
  }
}

export interface Thread {
  kind: string
  data: {
    id: string
    author: string
    title: string
    url: string
    subreddit: string
    created_utc: number
  }
}

export interface CommentsReq {
  thread_id: string
  limit?: number,
  sort?: 'new' | 'best' | 'controversial' | 'top'
  after?: string
}

export interface CommentsResp {
  errors: string[]
  data: {
    kind: 'Listing'
    data: {
      before: null | string
      after: string
      dist: number
      children: Comment[]
    }
  }[]
}

export interface Comment {
  kind: string
  data: {
    id: string
    author: string
    body: string
    permalink: string
    subreddit: string
    subreddit_id: string
    replies: {
      data: {
        children: Comment[]
      }
    }
  }
}
