
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getChatUser } from "../../../lib/chat-auth";
import { pusher } from "../../../lib/pusher-server";

async function getCommunityRoom() {
  let room = await prisma.chatRoom.findFirst({
    where: { type: "community" },
  });

  if (!room) {
    room = await prisma.chatRoom.create({
      data: {
        name: "FraudShield Community",
        type: "community",
      },
    });
  }

  return room;
}

// GET: Load latest 50 messages
export async function GET(request: NextRequest) {
  try {
    const user = await getChatUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const room = await getCommunityRoom();

    const messages = await prisma.chatMessage.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error("Community GET error:", error);

    return NextResponse.json(
      { message: "Unable to load messages." },
      { status: 500 }
    );
  }
}

// POST: Send a new message
export async function POST(request: NextRequest) {
  try {
    const user = await getChatUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const content =
      typeof body.content === "string" ? body.content.trim() : "";

    if (!content || content.length > 2000) {
      return NextResponse.json(
        { message: "Message must contain 1 to 2000 characters." },
        { status: 400 }
      );
    }

    const room = await getCommunityRoom();

    const message = await prisma.chatMessage.create({
      data: {
        content,
        roomId: room.id,
        senderId: user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    let realtime = true;

    try {
    
await pusher.trigger(
  "private-community-chat",
  "new-message",
  message
);

    } catch (pusherError) {
      realtime = false;
      console.error("Pusher broadcast error:", pusherError);
    }

    return NextResponse.json(
      {
        success: true,
        realtime,
        message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Community POST error:", error);

    return NextResponse.json(
      { message: "Unable to send message." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a community message
export async function DELETE(request: NextRequest) {
  try {
    const user = await getChatUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const messageId = Number(body.messageId);

    if (!Number.isInteger(messageId) || messageId <= 0) {
      return NextResponse.json(
        { message: "Invalid message ID." },
        { status: 400 }
      );
    }

    // Find the message
    const existingMessage = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!existingMessage) {
      return NextResponse.json(
        { message: "Message not found." },
        { status: 404 }
      );
    }

  if (existingMessage.isDeleted) {
  const isOwner = existingMessage.senderId === user.id;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    return NextResponse.json(
      { message: "You are not allowed to remove this deleted message." },
      { status: 403 }
    );
  }

  await prisma.chatMessage.delete({
    where: { id: messageId },
  });

  try {
    await pusher.trigger(
      "private-community-chat",
      "message-removed",
      { id: messageId }
    );
  } catch (error) {
    console.error("Pusher message removal error:", error);
  }

  return NextResponse.json({
    success: true,
    message: "Deleted message removed permanently.",
    messageId,
  });
}

    // Only sender or admin can delete
    const isOwner = existingMessage.senderId === user.id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { message: "You are not allowed to delete this message." },
        { status: 403 }
      );
    }

    // Keep the record but remove its original content
    const deletedMessage = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content: "",
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Notify all connected community chat users
    let realtime = true;

    try {
      await pusher.trigger(
        "private-community-chat",
        "message-deleted",
        {
          id: deletedMessage.id,
          roomId: deletedMessage.roomId,
          isDeleted: true,
        }
      );
    } catch (pusherError) {
      realtime = false;
      console.error("Pusher delete broadcast error:", pusherError);
    }

    return NextResponse.json({
      success: true,
      realtime,
      message: "Message deleted successfully.",
      messageId: deletedMessage.id,
    });

  } catch (error) {
    console.error("Community DELETE error:", error);

    return NextResponse.json(
      { message: "Unable to delete message." },
      { status: 500 }
    );
  }
}
