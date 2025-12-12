"use client";

import { Navbar } from "@/components/navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen pt-16 gap-4">
        <h1 className="text-4xl font-bold">Hello Alifh</h1>
        <p className="text-sm text-muted-foreground">
          Try clicking the user icon in the navbar above to test the modals
        </p>
      </div>
    </>
  );
}
