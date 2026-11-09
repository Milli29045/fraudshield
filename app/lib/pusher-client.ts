
import Pusher from "pusher-js";

const key = process.env.NEXT_PUBLIC_PUSHER_KEY?.trim();
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER?.trim();

export const pusherClient = new Pusher(key || "", {
  cluster: cluster || "ap2",
  channelAuthorization: {
    endpoint: "/api/chat/pusher/auth",
    transport: "ajax",
  },
});
