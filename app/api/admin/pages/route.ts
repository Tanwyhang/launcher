import { NextResponse } from "next/server";
import { listPostsForAdmin } from "@/lib/db";
import { hasAdminSession } from "@/lib/admin-security";

export async function GET() {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await listPostsForAdmin();
  return NextResponse.json(posts);
}
