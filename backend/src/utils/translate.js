const { translate, detectLanguage } = require("libretranslate").default;

const translateText = async (text, targetLang = "en") => {
  try {
    const detected = await detectLanguage(text);

    // If already English, return original
    if (detected === "en") return text.toLowerCase();

    const translated = await translate({
      q: text,
      source: detected,
      target: targetLang
    });

    return translated.toLowerCase();
  } catch (error) {
    console.error("Translation error:", error);
    return text.toLowerCase(); // Fallback
  }
};

module.exports = translateText;
