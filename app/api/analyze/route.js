/**
 * POST /api/analyze
 * Llama a Meta Graph API y devuelve los datos del perfil.
 * Las credenciales (META_ACCESS_TOKEN) quedan solo en el servidor.
 */

import { NextResponse } from "next/server";
import { getFacebookPage, getInstagramAccount } from "@/lib/meta";

export async function POST(request) {
  try {
    const { handle, platform } = await request.json();

    if (!handle || !platform) {
      return NextResponse.json(
        { error: "Faltan parámetros: handle y platform son requeridos." },
        { status: 400 }
      );
    }

    if (!process.env.META_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "META_ACCESS_TOKEN no configurado en las variables de entorno." },
        { status: 500 }
      );
    }

    let data;
    if (platform === "facebook") {
      data = await getFacebookPage(handle);
    } else if (platform === "instagram") {
      data = await getInstagramAccount(handle);
    } else {
      return NextResponse.json({ error: "Platform inválido. Usá 'facebook' o 'instagram'." }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });

  } catch (err) {
    console.error("[/api/analyze]", err.message);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
