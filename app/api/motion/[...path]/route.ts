import { NextRequest, NextResponse } from "next/server";

const ALLOWED_PATHS = ["tasks", "optimize", "health", "ws"];

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleProxy(request, params.path);
}

async function handleProxy(request: NextRequest, pathSegments: string[]) {
  const rootPath = pathSegments[0];
  if (!ALLOWED_PATHS.includes(rootPath)) {
    return NextResponse.json(
      { error: "Forbidden path in Motion proxy" },
      { status: 403 }
    );
  }

  const motionBaseUrl = process.env.MOTION_API_URL || "http://localhost:8000";
  const motionApiKey = process.env.MOTION_API_KEY || "";
  const subpath = pathSegments.join("/");
  const targetUrl = new URL(`/api/${subpath}${request.nextUrl.search}`, motionBaseUrl);

  try {
    const headers: Record<string, string> = {
      "X-API-Key": motionApiKey,
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    if (["POST", "PATCH", "PUT"].includes(request.method)) {
      const bodyText = await request.text();
      if (bodyText) options.body = bodyText;
    }

    const response = await fetch(targetUrl.toString(), options);
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch {
    // If external Motion backend isn't reachable, return safe proxy status
    return NextResponse.json(
      { error: "Motion backend offline or unreachable via proxy" },
      { status: 502 }
    );
  }
}
