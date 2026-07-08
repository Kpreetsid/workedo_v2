package com.presage.one

import android.net.Uri
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions

class MacTextRecognitionModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "MacTextRecognition"

  @ReactMethod
  fun recognizeTextFromImage(uriString: String, promise: Promise) {
    try {
      val imageUri = Uri.parse(uriString)
      val image = InputImage.fromFilePath(reactApplicationContext, imageUri)
      val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

      recognizer.process(image)
        .addOnSuccessListener { result ->
          promise.resolve(result.text ?: "")
        }
        .addOnFailureListener { error ->
          promise.reject("OCR_FAILED", error.message ?: "Unable to recognize text from the image.", error)
        }
        .addOnCompleteListener {
          recognizer.close()
        }
    } catch (error: Exception) {
      promise.reject("OCR_IMAGE_ERROR", error.message ?: "Unable to open the selected image.", error)
    }
  }
}
