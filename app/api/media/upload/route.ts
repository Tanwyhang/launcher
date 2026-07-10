import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

const UPLOAD_BUCKET = process.env.NEXT_PUBLIC_MEDIA_BUCKET || "launcher-media";
const AUTH_TOKEN = process.env.UPLOAD_AUTH_TOKEN;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function createServerClient() {
  if (!supabaseUrl || !supabaseAnon) {
    return null;
  }

  const key = supabaseServiceRole || supabaseAnon;

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function isAuthorized(request: Request) {
  const headerToken = request.headers.get("x-upload-token");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const providedToken = headerToken || bearerToken;

  return !!AUTH_TOKEN && providedToken === AUTH_TOKEN;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, and AVIF uploads are supported" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image exceeds the 5 MB upload limit" }, { status: 413 });
  }

  const client = createServerClient();

  if (!client) {
    return NextResponse.json({ error: "Media storage is not configured" }, { status: 503 });
  }

  const fileName = (file.name && file.name.trim()) || "upload.webp";
  const extension = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf("."))
    : ".webp";
  const safeName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const path = `cms/${safeName}`;

  const data = await client.storage
    .from(UPLOAD_BUCKET)
    .upload(path, file, {
      contentType: file.type || "image/webp",
      upsert: true,
    });

  if (data.error) {
    return NextResponse.json({ error: data.error.message }, { status: 500 });
  }

  const { data: urlData } = client.storage.from(UPLOAD_BUCKET).getPublicUrl(path);

  if (!urlData?.publicUrl) {
    return NextResponse.json({ error: "Upload completed but public URL unavailable" }, { status: 500 });
  }

  return NextResponse.json({ url: urlData.publicUrl });
}
