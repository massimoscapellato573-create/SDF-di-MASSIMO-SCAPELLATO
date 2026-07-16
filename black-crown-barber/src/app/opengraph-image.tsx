import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 0%, #1e1c1a 0%, #0b0b0c 65%)",
          color: "#f4efe4",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 9999,
            border: "2px solid #c6a15b",
            color: "#c6a15b",
            fontSize: 44,
            marginBottom: 32,
          }}
        >
          B
        </div>
        <div style={{ display: "flex", fontSize: 72, letterSpacing: 2 }}>
          Black&nbsp;<span style={{ color: "#c6a15b" }}>Crown</span>&nbsp;Barber
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 28,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "rgba(244,239,228,0.65)",
          }}
        >
          Barbiere Premium · Catania
        </div>
      </div>
    ),
    { ...size }
  );
}
