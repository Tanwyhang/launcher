import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_BASE_PATH } from "@/lib/admin-constants";
import {
  clearAdminSession,
  hasAdminSession,
  isValidAdminCredentials,
  setAdminSession,
} from "@/lib/admin-security";

async function loginAction(formData: FormData) {
  "use server";

  const loginId = String(formData.get("loginId") || "").trim();
  const password = String(formData.get("password") || "");

  if (!isValidAdminCredentials(loginId, password)) {
    redirect(`${ADMIN_BASE_PATH}?error=1`);
  }

  await setAdminSession();
  redirect(ADMIN_BASE_PATH);
}

async function logoutAction() {
  "use server";

  await clearAdminSession();
  redirect(ADMIN_BASE_PATH);
}

export default async function SecureAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const authenticated = await hasAdminSession();

  if (!authenticated) {
    return (
      <section className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Restricted Console
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            Admin Login
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Sign in to access the SEO operator console.
          </p>

          <form action={loginAction} className="mt-8 space-y-5">
            <div>
              <label htmlFor="loginId" className="block text-sm font-medium text-slate-700">
                Login ID
              </label>
              <input
                id="loginId"
                name="loginId"
                type="text"
                className="mt-2 block w-full border border-slate-300 px-4 py-3 text-base text-slate-950 outline-none focus:border-slate-950"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="mt-2 block w-full border border-slate-300 px-4 py-3 text-base text-slate-950 outline-none focus:border-slate-950"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-rose-700">Invalid login ID or password.</p>
            ) : null}

            <button
              type="submit"
              className="inline-flex items-center justify-center bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Unlock admin
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Restricted Console</p>
          <p className="mt-1 text-sm text-slate-700">Authenticated SEO operator session</p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
            Log out
          </button>
        </form>
      </div>
      <AdminShell />
    </div>
  );
}
