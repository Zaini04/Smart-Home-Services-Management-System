export const getApiBaseUrl = () => {
  const raw =
    import.meta.env.VITE_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  return String(raw).replace(/\/+$/, "");
};

export const normalizeMediaPath = (mediaPath = "") => {
  return String(mediaPath).replace(/\\/g, "/").replace(/^\/+/, "");
};

export const buildMediaUrl = (mediaPath = "") => {
  if (!mediaPath) return "";
  return `${getApiBaseUrl()}/${normalizeMediaPath(mediaPath)}`;
};
