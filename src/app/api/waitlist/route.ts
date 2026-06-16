import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta girin." }, { status: 400 });
  }

  const { error } = await supabase.from("waitlist").insert({ email });

  if (error) {
    // PostgreSQL unique violation
    if (error.code === "23505") {
      return NextResponse.json({ message: "Zaten kayıtlısın!" }, { status: 200 });
    }
    return NextResponse.json({ error: "Bir hata oluştu, lütfen tekrar dene." }, { status: 500 });
  }

  return NextResponse.json({ message: "Kaydın alındı!" }, { status: 201 });
}
