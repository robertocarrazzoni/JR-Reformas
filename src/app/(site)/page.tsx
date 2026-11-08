import { CtaBand } from "@/components/site/cta-band";
import { FaqSection } from "@/components/site/faq-section";
import { GallerySection } from "@/components/site/gallery-section";
import { Hero } from "@/components/site/hero";
import { HowItWorksSection } from "@/components/site/how-it-works-section";
import { PillarsSection } from "@/components/site/pillars-section";
import { ServicesSection } from "@/components/site/services-section";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { getSessionUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getSessionUser();
  const bookingHref = user ? "/agendar" : "/login?next=%2Fagendar";

  return (
    <>
      <Hero bookingHref={bookingHref} />
      <PillarsSection />
      <ServicesSection />
      <HowItWorksSection bookingHref={bookingHref} />
      <GallerySection />
      <TestimonialsSection />
      <FaqSection />
      <CtaBand bookingHref={bookingHref} />
    </>
  );
}
