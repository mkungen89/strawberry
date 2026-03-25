import { TwitterApi } from "twitter-api-v2";

function getClient() {
  const appKey = process.env.X_CLIENT_ID;
  const appSecret = process.env.X_CLIENT_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error("X API credentials not configured.");
  }

  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
}

export async function postTweet(content: string): Promise<{ id: string; url: string }> {
  const client = getClient();
  const tweet = await client.v2.tweet(content);
  const id = tweet.data.id;
  const url = `https://x.com/i/web/status/${id}`;
  return { id, url };
}

export async function replyToTweet(content: string, replyToId: string): Promise<{ id: string; url: string }> {
  const client = getClient();
  const tweet = await client.v2.tweet({ text: content, reply: { in_reply_to_tweet_id: replyToId } });
  const id = tweet.data.id;
  const url = `https://x.com/i/web/status/${id}`;
  return { id, url };
}
