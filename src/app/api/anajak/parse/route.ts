import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `จากข้อความคำสั่งซื้อเสื้อ ให้ extract ข้อมูลเป็น JSON

สิ่งที่ต้อง extract:
- orderCode: รหัสคำสั่งซื้อ
- ccUsed: รวม CC ทุกสกรีนในรายการสินค้าเดียวกัน
  - แต่ละบรรทัดสกรีนมีรูป "color/white CC" เช่น "1/9 CC" หมายถึง หมึกสี 1, หมึกขาว 9
  - รวมแบบ: บวกหมึกสีทั้งหมด, บวกหมึกขาวทั้งหมด แล้วเขียนเป็น "color/white"
  - ตัวอย่าง: สกรีน 4 บรรทัด 1/9, 1/1, 1/7, 1/1 → ccUsed = "4/18"
- เสื้อจากส่วน "รายการเสื้อ:" เท่านั้น (ห้ามใช้ส่วน "ราคาเสื้อ + สกรีน")
- shippingCost, grandTotal, trackingLink

กฎการรวมแถว: ถ้าเสื้อชื่อเดียวกันและสีเดียวกัน ให้รวมเป็นแถวเดียว โดยรวมไซส์ทั้งหมดไว้ในฟิลด์ size เช่น "S=2 M=8 XL=5"
ข้อมูลเสื้อในแต่ละรายการสินค้าจะใช้ ccUsed ชุดเดียวกัน (รวมจากสกรีนของรายการนั้น ๆ)

ตอบเป็น JSON ตาม schema นี้เท่านั้น:
{
  "orderCode": "string",
  "rows": [
    {
      "orderCode": "string",
      "ccUsed": "string (รูปแบบ \"color/white\" เช่น \"4/18\")",
      "shirtName": "string",
      "size": "string (รวมไซส์ เช่น \"S=2 M=8 XL=5\")",
      "color": "string",
      "quantity": number (จำนวนรวมทุกไซส์)
    }
  ],
  "shippingCost": number,
  "grandTotal": number,
  "trackingLink": "string"
}`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: { text: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { text } = body;
  if (!text || typeof text !== "string") {
    return NextResponse.json(
      { error: "Missing 'text' field" },
      { status: 400 }
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0,
      },
    });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `ข้อความคำสั่งซื้อ:\n${text}` },
    ]);

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return NextResponse.json(parsed);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to parse with Gemini: ${message}` },
      { status: 500 }
    );
  }
}
