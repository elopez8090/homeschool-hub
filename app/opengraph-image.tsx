import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Christian Homeschools Hub — find Christian homeschool programs by state";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const font = await readFile(join(process.cwd(), "app/fonts/GeistVF.woff"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#1e3a8a",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 6,
            color: "#c4a35a",
            fontWeight: 700,
          }}
        >
          CHRISTIAN HOMESCHOOL DIRECTORY
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            Christian Homeschools Hub
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 32,
              lineHeight: 1.35,
              color: "#dbeafe",
              maxWidth: 920,
            }}
          >
            Find Christ-centered programs, co-ops, and resources by state.
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#f7f1e8" }}>
          Owner verification · ESA eligibility · Free to browse
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: font,
          style: "normal",
          weight: 400,
        },
      ],
    },
  );
}
