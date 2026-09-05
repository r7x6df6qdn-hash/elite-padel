import { NextRequest, NextResponse } from "next/server";
import { getSettings, setSetting, SETTING_KEYS, type SettingKey } from "@/lib/settings";

function isAdmin(request: NextRequest) {
  return request.cookies.get("admin_session")?.value === "authenticated";
}

const EDITABLE_KEYS = new Set<SettingKey>([
  SETTING_KEYS.WIFI_SSID,
  SETTING_KEYS.WIFI_PASSWORD,
]);

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Ungültiger Request-Body." }, { status: 400 });
  }

  const updates: Array<[SettingKey, string]> = [];
  for (const [key, value] of Object.entries(body)) {
    if (!EDITABLE_KEYS.has(key as SettingKey)) continue;
    if (typeof value !== "string") {
      return NextResponse.json(
        { error: `Wert für "${key}" muss ein String sein.` },
        { status: 400 }
      );
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return NextResponse.json(
        { error: `Wert für "${key}" darf nicht leer sein.` },
        { status: 400 }
      );
    }
    if (trimmed.length > 200) {
      return NextResponse.json(
        { error: `Wert für "${key}" ist zu lang (max. 200 Zeichen).` },
        { status: 400 }
      );
    }
    updates.push([key as SettingKey, trimmed]);
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "Keine bearbeitbaren Werte übermittelt." }, { status: 400 });
  }

  await Promise.all(updates.map(([key, value]) => setSetting(key, value)));
  const settings = await getSettings();
  return NextResponse.json(settings);
}
