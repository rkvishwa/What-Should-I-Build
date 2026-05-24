import { ImageResponse } from "next/og";
import { LOGO_MARK_SVG } from "@/lib/brand/logo-mark";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  const mark = encodeURIComponent(LOGO_MARK_SVG);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#18181b",
          borderRadius: 7,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml,${mark}`}
          width={20}
          height={20}
          alt=""
        />
      </div>
    ),
    { ...size },
  );
}
