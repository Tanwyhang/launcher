import { ImageResponse } from "next/og";

export const alt = "launcher independent APAC product guides";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ alignItems: "center", background: "white", color: "black", display: "flex", height: "100%", justifyContent: "center", padding: 64, width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, width: "100%" }}>
          <div style={{ alignItems: "center", display: "flex", gap: 18 }}>
            <div style={{ alignItems: "center", background: "black", borderRadius: 22, color: "white", display: "flex", fontSize: 52, height: 92, justifyContent: "center", width: 92 }}>L</div>
            <div style={{ fontSize: 58, fontWeight: 600 }}>launcher</div>
          </div>
          <div style={{ fontSize: 72, fontWeight: 500, letterSpacing: -2, lineHeight: 1.08 }}>Independent product decisions for APAC</div>
          <div style={{ color: "#525252", fontSize: 32 }}>English · Bahasa Malaysia · 简体中文</div>
        </div>
      </div>
    ),
    size,
  );
}
