export const getApiBaseUrl = () => {
  const raw =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  // Carefully strip surrounding quotes and trailing slashes
  return String(raw).replace(/^['"]+/, "").replace(/['"]+$/, "").replace(/\/+$/, "");
};

export const normalizeMediaPath = (mediaPath = "") => {
  return String(mediaPath).replace(/\\/g, "/").replace(/^\/+/, "");
};

export const buildMediaUrl = (mediaPath = "") => {
  if (!mediaPath) return "";
  if (String(mediaPath).startsWith("http://") || String(mediaPath).startsWith("https://")) {
    return mediaPath;
  }
  return `${getApiBaseUrl()}/${normalizeMediaPath(mediaPath)}`;
};
