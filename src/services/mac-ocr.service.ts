import { NativeModules, Platform } from "react-native";

const MacTextRecognitionModule = NativeModules.MacTextRecognition as
  | {
      recognizeTextFromImage: (uri: string) => Promise<string>;
    }
  | undefined;

const normalizeLikelyHexText = (value: string) =>
  value
    .toUpperCase()
    .replace(/O/g, "0")
    .replace(/[IL]/g, "1")
    .replace(/S/g, "5");

export const normalizeMacIdFromText = (rawText: string): string | null => {
  if (!rawText) return null;

  const normalized = normalizeLikelyHexText(rawText);

  const explicitMatch = normalized.match(/(?:[A-F0-9]{2}[:-]){5}[A-F0-9]{2}/);
  if (explicitMatch?.[0]) {
    return explicitMatch[0].replace(/-/g, ":");
  }

  const compact = normalized.replace(/[^A-F0-9]/g, "");
  const compactMatch = compact.match(/[A-F0-9]{12}/);
  if (compactMatch?.[0]) {
    return compactMatch[0].match(/.{1,2}/g)?.join(":") ?? null;
  }

  return null;
};

export const recognizeMacIdFromImage = async (uri: string) => {
  if (Platform.OS !== "android") {
    throw new Error("MAC scanning is currently available on Android builds only.");
  }

  if (!MacTextRecognitionModule?.recognizeTextFromImage) {
    throw new Error("ML Kit text recognition is not available in this build. Rebuild the Android app and try again.");
  }

  const rawText = await MacTextRecognitionModule.recognizeTextFromImage(uri);
  const macId = normalizeMacIdFromText(rawText);

  return {
    rawText,
    macId,
  };
};
