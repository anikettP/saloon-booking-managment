// frontend/src/components/UserAvatar.jsx
import React from "react";

// gradients for variety
const AVATAR_GRADIENTS = [
  "from-yellow-400 to-amber-500",
  "from-pink-400 to-rose-500",
  "from-purple-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-orange-400 to-red-500",
];

// simple hash to pick a gradient index
const getAvatarGradient = (key) => {
  const str = key || "";
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
};

const UserAvatar = ({ name, id, size = "md" }) => {
  const displayName =
    name && String(name).trim().length > 0 ? String(name).trim() : "User";
  const initial = displayName[0].toUpperCase();

  const key = id || displayName;
  const gradientClass = getAvatarGradient(key);

  const sizeClasses =
    size === "sm"
      ? "w-8 h-8 text-sm"
      : size === "lg"
      ? "w-14 h-14 text-xl"
      : "w-11 h-11 text-base";

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-black font-bold shadow-inner shrink-0 ${sizeClasses}`}
    >
      {initial}
    </div>
  );
};

export default UserAvatar;
