// src/components/ProfilePicture.jsx
import { useState } from "react";

export default function ProfilePicture() {
  // ✅ New profile image ID
  const PROFILE_ID = "1G3bAWcvNjjffDDFX1vyZjpwmKgkM-6Xk";

  // Multiple fallback URLs in case one fails to load
  const PROFILE_SOURCES = [
    `https://drive.google.com/uc?export=view&id=${PROFILE_ID}`,
    `https://lh3.googleusercontent.com/d/${PROFILE_ID}=s256`,
    `https://drive.google.com/thumbnail?id=${PROFILE_ID}&sz=w256`,
  ];

  const [i, setI] = useState(0);
  const src = PROFILE_SOURCES[i] || "";

  return (
    <img
      src={src}
      alt="Profile"
      onClick={() => (window.location.hash = "#profileqr")}
      onError={() => {
        if (i < PROFILE_SOURCES.length - 1) setI((x) => x + 1);
      }}
      className="h-12 w-12 rounded-full object-cover ring-2 ring-white/70 shadow-md cursor-pointer transition-transform hover:scale-105"
      title="Show Profile QR"
    />
  );
}
