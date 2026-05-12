export function getFallbackAvatarUrl(user) {
  const seed = encodeURIComponent(user?.id || user?.email || user?.name || "traveller");
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&radius=50&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function getUserAvatarUrl(user) {
  const uploadedAvatar = typeof user?.avatarUrl === "string" ? user.avatarUrl.trim() : user?.avatarUrl;
  return uploadedAvatar || getFallbackAvatarUrl(user);
}

