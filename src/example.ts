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
    const thread = await this.createThread('YourSubreddit', dailyThread())
    await this.r.sticky(thread.data.id) // TODO This 500's for some reason, use automod
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
