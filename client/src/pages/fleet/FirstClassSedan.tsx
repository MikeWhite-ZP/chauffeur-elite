import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function FirstClassSedan() {
  const features = [
    "Professional chauffeur service",
    "Luxurious leather seating",
    "Advanced climate control",
    "Premium sound system",
    "High-speed WiFi connectivity",
    "USB charging ports",
    "Ambient lighting",
    "Extended legroom",
    "Complimentary bottled water",
    "Advanced safety features",
    "Privacy glass windows",
    "Rear seat entertainment"
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-black text-white">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-5xl mb-8 text-center">
          First Class Sedan Service
        </h1>
        
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Vehicle Image Section */}
          <section className="relative h-[60vh] rounded-lg overflow-hidden">
            <div className="relative h-full w-full">
              <img
                src="/2025-S-Class.jpg"
                alt="Mercedes-Benz S-Class Luxury Sedan"
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null; // Prevent infinite loop
                  img.src = "/logo-red_200x200px.png";
                  img.alt = "Mercedes-Benz S-Class - Fallback Image";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </section>

          {/* Description Section */}
          <section className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="font-serif text-3xl">Ultimate Luxury Travel</h2>
              <p className="text-lg leading-relaxed text-gray-300">
                Experience the epitome of luxury transportation with our First Class Sedan service. The Mercedes-Benz S-Class, renowned for its unparalleled comfort and sophistication, sets the standard for executive travel. Each journey is crafted to provide an exceptional blend of luxury, comfort, and professional service.
              </p>
              <p className="text-lg leading-relaxed text-gray-300">
                Our First Class Sedan service is perfect for business executives, VIP transfers, and special occasions where making a sophisticated impression is paramount. The S-Class's iconic design, coupled with its state-of-the-art technology and premium amenities, ensures a journey that's as memorable as your destination.
              </p>
            </div>

            <div className="bg-white/5 p-8 rounded-lg border border-white/10">
              <h3 className="font-serif text-2xl mb-6">Features & Amenities</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <span className="mr-2">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Booking Section */}
          <section className="text-center space-y-6">
            <h2 className="font-serif text-3xl">Ready to Experience First Class?</h2>
            <p className="text-lg text-gray-300">
              Book your luxury sedan service today and discover the perfect blend of comfort and sophistication.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/book" className="bg-white text-black hover:bg-white/90">
                  Book Now
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/about/contact-us" className="border-white text-white hover:bg-white/10">
                  Contact Us
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
