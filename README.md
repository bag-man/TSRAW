# TypeScript Reddit API Wrapper (TSRAW)

This is a proof of concept for a TypeScript wrapper for the Reddit API. 


Example bootstrap code:

```TypeScript

require('dotenv').config()
import { TSRAW } from "./TSRAW.js"
import { SubmitArgs } from "./types.js"

const { REDDIT_USER_AGENT, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD } = process.env

const CREDENTIALS = {
  user_agent: REDDIT_USER_AGENT!,
  client_id: REDDIT_CLIENT_ID!,
  client_secret: REDDIT_CLIENT_SECRET!,
  username: REDDIT_USERNAME!,
  password: REDDIT_PASSWORD!,
}

export class RedditBot {
  private r: TSRAW

  constructor(r: TSRAW) {
    this.r = r
  }

  async start() {
    const thread = await this.createThread('test', dailyThread())
  }

  async createThread(subreddit: string, content: ThreadContent) {
    const submission: SubmitArgs = {
      sr: subreddit,
      title: content.title,
      text: content.body,
      kind: 'self',
      sendreplies: false
    }

    return this.r.submit(submission)
  }
}

interface ThreadContent { title: string, body: string }

const dailyThread = (): ThreadContent => {
  const title =
    `Daily Discussion Thread (${new Date().toISOString().split('T')[0]})`

  const body =
    `Talk about anything your heart desires. Be polite and upvote everything!\n\n`+
    `How has your day been?`

  return { title, body }
}

const main = async () => {
  try {
    const r = await TSRAW.init(CREDENTIALS)
    const bot = new RedditBot(r)
    await bot.start()
  } catch (cause) {
    console.error(new Date().toISOString(), cause)
    process.exit(1312)
  }
}

main()

```

Interaces, see src/types.d.ts for more details

```TypeScript
  constructor(token: string)

  static init(credentials: TSRAWCredentials): Promise<TSRAW>

  private rq<T extends RedditRes>(request: AxiosRequestConfig, raw?: boolean): Promise<T>

  submit (submission: SubmitArgs): Promise<SubmitResp>

  edit (post: EditArgs): Promise<SubmitResp>

  sticky (id: string): Promise<RedditRes> // Returns 500 (https://redd.it/1h41n06)

  getSettings (subreddit: string): Promise<SettingsResp>

  getMe (): Promise<AboutResp>

  updateSidebar (subreddit: string, description: string): Promise<RedditRes>

  threads (params: ThreadsReq): Promise<Thread[]>

  comments (params: CommentsReq): Promise<Comment[]>
```
