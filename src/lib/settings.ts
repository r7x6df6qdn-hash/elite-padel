import { prisma } from "@/lib/prisma";

/**
 * Key-value settings store (backed by the Setting Prisma model).
 *
 * Admin-editable runtime config that shouldn't live in env vars:
 * WiFi credentials, announcements, venue info, etc.
 *
 * Access patterns:
 *   - Email templates read via getWifi() at send time
 *   - Admin dashboard reads all via getSettings(), writes via setSetting()
 *
 * Missing keys fall back to the DEFAULTS below — so the app still works on
 * a fresh DB where seed hasn't been run yet (e.g. preview deploys).
 */

export const SETTING_KEYS = {
  WIFI_SSID: "wifi_ssid",
  WIFI_PASSWORD: "wifi_password",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

const DEFAULTS: Record<SettingKey, string> = {
  [SETTING_KEYS.WIFI_SSID]: "Rückwand Guest",
  [SETTING_KEYS.WIFI_PASSWORD]: "Elitepadel2026",
};

export async function getSetting(key: SettingKey): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? DEFAULTS[key];
}

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: Object.values(SETTING_KEYS) } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    [SETTING_KEYS.WIFI_SSID]: map[SETTING_KEYS.WIFI_SSID] ?? DEFAULTS[SETTING_KEYS.WIFI_SSID],
    [SETTING_KEYS.WIFI_PASSWORD]:
      map[SETTING_KEYS.WIFI_PASSWORD] ?? DEFAULTS[SETTING_KEYS.WIFI_PASSWORD],
  };
}

export async function setSetting(key: SettingKey, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getWifi(): Promise<{ ssid: string; password: string }> {
  const s = await getSettings();
  return {
    ssid: s[SETTING_KEYS.WIFI_SSID],
    password: s[SETTING_KEYS.WIFI_PASSWORD],
  };
}
