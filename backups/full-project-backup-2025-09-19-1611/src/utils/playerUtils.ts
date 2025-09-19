
export const formatPlayerName = (username: string, level: number): string => {
  if (!username) {
    return `[Уровень ${level}]`;
  }
  return `${username} [${level}]`;
};
