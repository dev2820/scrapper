export const uuid = () => {
  const randomUUID = (globalThis as { crypto?: { randomUUID?: () => string } })
    .crypto?.randomUUID;

  if (typeof randomUUID === "function") {
    return randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};
