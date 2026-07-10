import { cookies } from "next/headers";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";

const ADMIN_LOGIN_ID = process.env.ADMIN_LOGIN_ID;
const ADMIN_LOGIN_PASSWORD = process.env.ADMIN_LOGIN_PASSWORD;
const ADMIN_SESSION_COOKIE = "launcher_admin_session";
const ADMIN_SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN;

export function getAdminLoginId() {
  return ADMIN_LOGIN_ID || "";
}

export function getAdminLoginPassword() {
  return ADMIN_LOGIN_PASSWORD || "";
}

export function isValidAdminCredentials(loginId: string, password: string) {
  return !!ADMIN_LOGIN_ID && !!ADMIN_LOGIN_PASSWORD && loginId === ADMIN_LOGIN_ID && password === ADMIN_LOGIN_PASSWORD;
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  return !!ADMIN_SESSION_TOKEN && cookieStore.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_TOKEN;
}

export async function setAdminSession() {
  if (!ADMIN_SESSION_TOKEN) {
    throw new Error("Admin session is not configured");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, ADMIN_SESSION_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
