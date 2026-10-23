
export function analyzeSentiment(content: string): string {
  const text = content.toLowerCase();

  const positiveWords = [
    "good",
    "great",
    "useful",
    "excellent",
    "easy",
    "helpful",
    "love",
    "best",
    "amazing",
    "trusted",
  ];

  const negativeWords = [
    "bad",
    "fake",
    "fraud",
    "scam",
    "fraudulent",
    "terrible",
    "useless",
    "harmful",
    "worst",
    "hate",
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  for (const word of positiveWords) {
    if (text.includes(word)) positiveScore++;
  }

  for (const word of negativeWords) {
    if (text.includes(word)) negativeScore++;
  }

  if (positiveScore > negativeScore) return "Positive";
  if (negativeScore > positiveScore) return "Negative";

  return "Neutral";
}
