"use client";

import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="Election Management System Logo"
            width={60}
            height={60}
            className="rounded-md"
          />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Election Management System</h1>
          <p className="text-gray-500">Version 1</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
