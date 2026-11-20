export const newId = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`;
