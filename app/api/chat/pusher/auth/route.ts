
import { NextRequest, NextResponse } from "next/server";
import { getChatUser } from "../../../../lib/chat-auth";
import { pusher } from "../../../../lib/pusher-server";
export async function POST(request: NextRequest) {
  try {
    const user = await getChatUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const socketId = formData.get("socket_id");
    const channelName = formData.get("channel_name");

    if (
      typeof socketId !== "string" ||
      typeof channelName !== "string" ||
      !/^\d+\.\d+$/.test(socketId)
    ) {
      return NextResponse.json(
        { message: "Invalid Pusher request." },
        { status: 400 }
      );
    }

    if (channelName !== "private-community-chat") {
      return NextResponse.json(
        { message: "Channel access denied." },
        { status: 403 }
      );
    }

    const auth = pusher.authorizeChannel(
      socketId,
      channelName
    );

    return NextResponse.json(auth);

  } catch (error) {
    console.error("Pusher authentication error:", error);

    return NextResponse.json(
      { message: "Unable to authorize Pusher channel." },
      { status: 500 }
    );
  }
}
