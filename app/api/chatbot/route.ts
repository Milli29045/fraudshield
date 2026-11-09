
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "Gemini API key is missing." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const message = body.message;

    if (
      typeof message !== "string" ||
      !message.trim() ||
      message.length > 2000
    ) {
      return NextResponse.json(
        { message: "Please enter a valid message (maximum 2000 characters)." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
     model: "gemini-3.5-flash-lite",
      contents: message.trim(),
      config: {
        systemInstruction: `
          You are FraudShield AI Assistant.

          Your purpose is to help users understand:
          - Online fraud and scams.
          - Suspicious phone numbers and emails.
          - Fraudulent websites and applications.
          - Phishing messages and fake links.
          - Online privacy and digital safety.
          - How to use the FraudShield website.

          Give clear, friendly and practical answers.
          Language Rules:
- If the user's latest message is in English, reply entirely in English.
- If the user's latest message is in Roman Urdu, reply entirely in Roman Urdu.
- If the user's latest message is in Urdu script, reply in Urdu script.
- Always detect the language of the latest user message.
- Never reply in Roman Urdu to an English question.
- Never reply in English to a Roman Urdu question.
- Do not mix languages unless the user does so.

          Important:
          - Never claim that you have checked a phone number,
            email, website or application unless an actual checking
            tool has provided that result.
          - Never guarantee that a website or contact is 100% safe.
          - Warn users not to share passwords, OTPs or bank details.
          - If a user asks an unrelated question, politely guide
            them back to FraudShield and online safety.
        `,
      },
    });

    return NextResponse.json({
      success: true,
      reply: response.text || "Sorry, I could not generate a response.",
    });
  } catch (error) {
    console.error("Gemini chatbot error:", error);

    return NextResponse.json(
      { message: "AI assistant is temporarily unavailable. Please try again." },
      { status: 500 }
    );
  }
}
