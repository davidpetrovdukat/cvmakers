import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      dateOfBirth, 
      street, 
      city,
      country, 
      postalCode 
    } = await req.json();

    // Валидация обязательных полей
    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing email or password" },
        { status: 400 },
      );
    }

    if (!firstName || !lastName || !dateOfBirth || !street || !city || !country || !postalCode) {
      return NextResponse.json(
        { message: "Missing required registration fields" },
        { status: 400 },
      );
    }

    // Валидация даты рождения
    const birthDate = new Date(dateOfBirth);
    if (isNaN(birthDate.getTime()) || birthDate > new Date()) {
      return NextResponse.json(
        { message: "Invalid date of birth" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: `${firstName} ${lastName}`.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: birthDate,
        street: street.trim(),
        city: city.trim(),
        country: country.trim(),
        postalCode: postalCode.trim(),
      },
    });

    // В случае успеха возвращаем созданного пользователя
    return NextResponse.json(newUser);
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    // ИЗМЕНЕНО: Возвращаем JSON с сообщением об ошибке
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
