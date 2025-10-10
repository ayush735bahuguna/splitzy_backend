import fetch from "node-fetch";
import { JWT } from "google-auth-library";
import userModel from "../User/userModel.ts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAccessTokenAsync(key: any): Promise<string> {
  const jwtClient = new JWT({
    email: key?.client_email,
    key: key?.private_key,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  return new Promise((resolve, reject) => {
    jwtClient.authorize((err, tokens) => {
      if (err) {
        return reject(err);
      }
      if (tokens?.access_token) {
        resolve(tokens.access_token);
      } else {
        reject(new Error("Failed to get access token"));
      }
    });
  });
}
const FCM_PROJECT_NAME = "YOUR_FCM_PROJECT_NAME",
  channelId = "your_channelId",
  scopeKey = "your_scopeKey",
  experienceId = "your_experienceId";

export const sendAndroidNotification = async (
  userIds: string[],
  title: string,
  message: string,
  body: string,
  image_url: string
) => {
  try {
    const users = await userModel.find({ _id: { $in: userIds } });
    const deviceTokens: string[] = users
      .map((e) => e.pushNotificationToken && e.pushNotificationToken.toString())
      .filter((token): token is string => !!token);

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const key = require("../../fcm.json");
    const firebaseAccessToken = await getAccessTokenAsync(key);

    const messageBody = {
      message: {
        tokens: deviceTokens,
        data: {
          channelId,
          title,
          message,
          body,
          image: image_url,
          scopeKey,
          experienceId,
        },
      },
    };

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_NAME}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firebaseAccessToken}`,
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FCM error: ${response.status} - ${errorText}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    throw error;
  }
};
