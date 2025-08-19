// ./chatbot/classifier.js
export default function classifyInput(userInput) {
  const keywords = ["design", "excalidraw", "matty ai", "font", "color", "shape"];

  for (const keyword of keywords) {
    if (userInput.toLowerCase().includes(keyword)) {
      return "design";
    }
  }

  return "other";
}
