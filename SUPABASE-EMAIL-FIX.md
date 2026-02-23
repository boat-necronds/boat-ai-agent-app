# 🔧 แก้ปัญหา Email Rate Limit ใน Supabase

## ปัญหา

`Email rate limit exceeded` - เกิดจากการส่ง confirmation email บ่อยเกินไปขณะ development

---

## ✅ วิธีแก้: ปิด Email Confirmation (Development Mode)

### ขั้นตอน:

1. **ไปที่ Supabase Dashboard**
   - เปิด https://supabase.com/dashboard
   - เลือก Project ของคุณ

2. **ไปที่ Authentication Settings**
   - คลิกเมนู **Authentication** (ด้านซ้าย)
   - คลิก **Providers**
   - เลื่อนลงหา **Email**

3. **ปิด Email Confirmation**
   - หา **"Confirm email"** toggle
   - **ปิด (Disable)** มัน
   - คลิก **Save**

4. **ตั้งค่า Auto Confirm (Optional แต่แนะนำ)**
   - ไปที่ **Settings** → **Auth**
   - เลื่อนลงหา **Email Auth**
   - เปิด **"Enable email confirmations"** = OFF
   - หรือตั้ง **"Confirm email"** = Disabled

---

## 🔄 หลังจากปิด Email Confirmation แล้ว

ตอนนี้เมื่อ register:

- ✅ User จะถูกสร้างทันที (ไม่ต้องรอ confirm email)
- ✅ สามารถ login ได้เลย
- ✅ ไม่มี rate limit email อีกต่อไป

---

## 🎯 วิธีอื่นๆ (ถ้าไม่อยากปิด Email Confirmation)

### วิธีที่ 2: ใช้ Email ใหม่ทุกครั้ง

- ใช้ email ต่างกันทุกครั้งที่ test
- เช่น: `test1@example.com`, `test2@example.com`, `test3@example.com`

### วิธีที่ 3: รอ 1 ชั่วโมง

- Rate limit จะ reset หลังจาก 1 ชั่วโมง
- แต่ไม่เหมาะสำหรับ development

### วิธีที่ 4: ลบ User เก่าออก

1. ไปที่ **Authentication** → **Users**
2. ลบ users ที่ test ไปแล้ว
3. ลอง register ใหม่อีกครั้ง

---

## 📝 สำหรับ Production

เมื่อ deploy production แล้ว:

- ✅ **เปิด Email Confirmation กลับมา** เพื่อความปลอดภัย
- ✅ พิจารณา upgrade Supabase plan ถ้ามี users เยอะ
- ✅ ตั้งค่า Custom SMTP (ถ้าต้องการ email limit สูงขึ้น)

---

## 🔍 ตรวจสอบว่าแก้สำเร็จ

หลังจากปิด Email Confirmation แล้ว:

1. ลอง register ด้วย email ใหม่
2. ควรเห็น toast "Registration successful!"
3. สามารถ login ได้ทันที (ไม่ต้องรอ confirm email)
