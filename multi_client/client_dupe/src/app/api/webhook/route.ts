/** @format */
import { NextResponse, NextRequest } from "next/server";

let eventStreams: any[] = [];
let latestMessage: any = null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    latestMessage = body;

    eventStreams.forEach((stream) => {
      const encoder = new TextEncoder();
      const data = `data: ${JSON.stringify(latestMessage)}\n\n`;
      stream.write(encoder.encode(data));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const client = {
        write: (chunk: Uint8Array) => controller.enqueue(chunk),
        close: () => controller.close(),
      };

      eventStreams.push(client);

      if (latestMessage) {
        const data = `data: ${JSON.stringify(latestMessage)}\n\n`;
        client.write(encoder.encode(data));
      }
    },
    cancel() {
      eventStreams = eventStreams.filter((s) => s !== this);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
