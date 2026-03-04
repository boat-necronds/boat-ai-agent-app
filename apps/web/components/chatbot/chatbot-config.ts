export const DEFAULT_GUIDE_TIPS = [
  "Send one topic at a time — one question or command per message for clear, step-by-step answers",
  "Multi-step flows: e.g. save your profile first, then ask for a weekly program",
  "You can send several things in one message, but the reply may be longer or cover multiple parts",
] as const;

export const GUIDE_TIPS_BY_SLUG: Record<string, string[]> = {
  fitness: [
    "ส่งทีละหัวข้อ — ถามหรือสั่งอย่างเดียวต่อข้อความ เพื่อคำตอบที่ชัดเจน",
    "ลำดับขั้น: บันทึกโปรไฟล์ก่อน แล้วค่อยขอโปรแกรมรายสัปดาห์",
    "สามารถส่งหลายอย่างในข้อความเดียวได้ แต่คำตอบอาจยาวหรือครอบคลุมหลายส่วน",
  ],
  "fitness-coach": [
    "ส่งทีละหัวข้อ — ถามหรือสั่งอย่างเดียวต่อข้อความ เพื่อคำตอบที่ชัดเจน",
    "ลำดับขั้น: บันทึกโปรไฟล์ก่อน แล้วค่อยขอโปรแกรมรายสัปดาห์",
    "สามารถส่งหลายอย่างในข้อความเดียวได้ แต่คำตอบอาจยาวหรือครอบคลุมหลายส่วน",
  ],
  weather: [
    "ระบุชื่อเมืองหรือพื้นที่ที่ต้องการดูสภาพอากาศ",
    "ถามได้ทั้งอุณหภูมิ สภาพอากาศ และคำแนะนำการแต่งตัว",
    "สามารถถามพยากรณ์หลายวันหรือเปรียบเทียบระหว่างเมือง",
  ],
  image: [
    "อธิบายภาพที่ต้องการให้ชัดเจน (องค์ประกอบ สี บรรยากาศ)",
    "ลองระบุสไตล์ เช่น minimalist, realistic, cartoon",
    "สามารถขอแก้ไขหรือสร้างหลายภาพในรอบเดียว",
  ],
  voice: [
    "ใส่ข้อความที่ต้องการให้อ่านออกเสียงหรือแปลงเป็นเสียง",
    "ระบุภาษาหากต้องการ (เช่น ไทย อังกฤษ)",
    "เหมาะสำหรับบทความสั้นหรือประโยคที่ต้องการฟัง",
  ],
  food: [
    "บอกเป้าหมาย (ลดน้ำหนัก สร้างกล้าม อาหารสุขภาพ) จะได้แนะนำให้ตรง",
    "ถามแคลอรี่หรือสารอาหารของมื้อ/เมนูได้",
    "ขอ meal plan รายวันหรือรายสัปดาห์ได้",
  ],
  finance: [
    "บอกเป้าหมายการเงินให้ชัด (เช่น เก็บเงินดาวน์บ้านใน 3 ปี, ปลดหนี้ใน 2 ปี)",
    "แชร์รายรับรายจ่ายคร่าว ๆ เพื่อให้ช่วยจัดงบประมาณได้แม่นยำขึ้น",
    "ถามเรื่องกองทุน/การลงทุนในระดับพื้นฐานได้ แต่ไม่ใช่คำแนะนำการลงทุนส่วนบุคคล",
  ],
  study: [
    "บอกระดับชั้น/วิชา/หัวข้อที่เรียนอยู่ เพื่อให้คำอธิบายตรงระดับ",
    "ส่งโน้ตหรือสรุปที่มีอยู่แล้วให้ช่วยจัดโครง/ทำ flashcard เพิ่มได้",
    "แบ่งเป้าหมายการอ่านเป็นช่วงสั้น ๆ (เช่น 25 นาที) เพื่อวางแผนอ่านหนังสือ",
  ],
  travel: [
    "ระบุเมือง/ประเทศ วันที่ และงบประมาณคร่าว ๆ เพื่อให้ช่วยออกแบบแผนเที่ยวได้ดีขึ้น",
    "บอกสไตล์ทริปที่ต้องการ (ชิล ๆ /สายกิน /สายธรรมชาติ /สายมิวเซียม ฯลฯ)",
    "ถามตัวเลือกที่พัก/การเดินทางระหว่างเมือง และให้ช่วยเปรียบเทียบข้อดีข้อเสียได้",
  ],
} as const;

export const DEFAULT_SUGGESTIONS = [
  "Save my profile: goal to lose fat, 3 days/week, beginner",
  "Design a weekly program for me",
  "Calculate daily calories for 70kg, 175cm, 30 years old, male",
  "Log that I ran 30 minutes today",
  "Remind me to exercise in 2 minutes",
] as const;

export const SUGGESTIONS_BY_SLUG: Record<string, string[]> = {
  "fitness-coach": [
    "Save my profile: goal to lose fat, 3 days/week, beginner",
    "Design a weekly program for me",
    "Calculate daily calories for 70kg, 175cm, 30 years old, male",
    "Log that I ran 30 minutes today",
    "Remind me to exercise in 2 minutes",
  ],
  fitness: [
    "Save my profile: goal to lose fat, 3 days/week, beginner",
    "Design a weekly program for me",
    "Calculate daily calories for 70kg, 175cm, 30 years old, male",
    "Log that I ran 30 minutes today",
    "Remind me to exercise in 2 minutes",
  ],
  weather: [
    "What's the weather in Bangkok today?",
    "Weather forecast for Chiang Mai this week",
    "Is it going to rain in Phuket tomorrow?",
    "Temperature and humidity in Singapore",
    "Compare weather: Bangkok vs Tokyo",
  ],
  image: [
    "Draw a sunset over the ocean",
    "Create an image of a cute robot",
    "Generate a minimalist logo for a coffee shop",
  ],
  voice: [
    "Read this aloud: Hello, welcome to the voice agent",
    "Convert to speech: The quick brown fox jumps over the lazy dog",
  ],
  food: [
    "Suggest a balanced meal for today",
    "Calculate calories for my lunch",
    "What are good protein sources?",
    "Meal plan for weight loss",
    "Healthy snacks for office",
  ],
  finance: [
    "ช่วยจัดงบประมาณรายเดือนจากรายรับ/รายจ่ายคร่าว ๆ",
    "วางแผนเก็บเงินดาวน์บ้านภายใน 3–5 ปี",
    "ไอเดียการแบ่งพอร์ตลงทุนแบบพื้นฐาน (ไม่ถือเป็นคำแนะนำการลงทุน)",
  ],
  study: [
    "สรุปบทเรียนหัวข้อที่กำลังอ่านอยู่ให้เข้าใจง่ายขึ้น",
    "ช่วยสร้าง flashcard สำหรับสอบในสัปดาห์หน้า",
    "วางแผนอ่านหนังสือหนึ่งสัปดาห์ก่อนสอบ",
  ],
  travel: [
    "ออกแบบทริป 3 วัน 2 คืน ในเชียงใหม่ สำหรับสายคาเฟ่และธรรมชาติ",
    "แนะนำแพลนเที่ยวโตเกียว 5 วัน พร้อมงบประมาณคร่าว ๆ",
    "เสนอ route เที่ยวยุโรป 7–10 วัน สำหรับมือใหม่",
  ],
} as const;

/** Cloudflare Workers SDK — ชื่อ binding บน boat-agent-all */
export function getCfAgentName(slug: string | null | undefined): string {
  if (slug === "image") return "ImageAgent";
  if (slug === "fitness-coach") return "FitnessCoachAgent";
  if (slug === "voice") return "VoiceAgent";
  return "ChatAgent";
}

