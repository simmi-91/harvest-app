export const findClosestPosition = (
  inputPosition: string,
  validPositions: string[]
): string => {
  if (!inputPosition) return validPositions[0] || "";
  const input = inputPosition.toLowerCase().trim();

  // Calculate similarity scores for remaining cases
  const similarities = validPositions.map((validPos) => ({
    position: validPos,
    score: calculateSimilarity(input, validPos.toLowerCase()),
  }));
  // Return the position with highest similarity
  similarities.sort((a, b) => b.score - a.score);
  return similarities[0]?.position || validPositions[0] || "";
};

export const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  // Count common characters
  let commonChars = 0;
  const str2Chars = str2.split("");

  for (const char of str1) {
    const index = str2Chars.indexOf(char);
    if (index !== -1) {
      commonChars++;
      str2Chars.splice(index, 1); // Remove to avoid double counting
    }
  }

  return commonChars / longer.length;
};
