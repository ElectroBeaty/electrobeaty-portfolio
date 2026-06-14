import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "electrobeaty_admin";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function signSession(timestamp, password) {
  return createHmac("sha256", password).update(`admin:${timestamp}`).digest("hex");
}

function isValidSession(session, password) {
  const [version, timestamp, signature] = String(session || "").split(".");
  if (version !== "v1" || !timestamp || !signature) return false;

  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt)) return false;
  if (Date.now() - issuedAt > SESSION_MAX_AGE * 1000) return false;

  const expected = signSession(timestamp, password);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  const password = getAdminPassword();

  return Boolean(password && isValidSession(session, password));
}

export async function setAdminSession() {
  const password = getAdminPassword();
  const timestamp = String(Date.now());
  const session = `v1.${timestamp}.${signSession(timestamp, password)}`;
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, session, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
