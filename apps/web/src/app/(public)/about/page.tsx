/**
 * About Us Page - Alifh
 * Learn about Alifh's mission and values
 */

import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Alifh',
  description: 'Learn about Alifh - The UAE\'s most transparent car marketplace.',
  openGraph: {
    title: 'About Us - Alifh',
    description: 'Learn about Alifh - The UAE\'s most transparent car marketplace.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Image */}
      <section className="relative w-full h-[60vh] min-h-[400px] max-h-[800px] mt-14 sm:mt-16">
        <Image
          src="/Images/alifh4.png"
          alt="Alifh - About Us"
          fill
          className="object-cover"
          priority
        />
      </section>

      {/* Future sections can be added here */}
      {/* <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">About Alifh</h1>
        <p className="text-lg text-muted-foreground">Your content here...</p>
      </section> */}
    </div>
  );
}
