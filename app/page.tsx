import { cookies } from "next/headers";
import { AB_VARIANT_COOKIE, isValidVariant } from "@/lib/ab-testing";
import { HERO_VARIANTS } from "@/lib/landing-content";
import { LandingBackground } from "@/components/landing/LandingBackground";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CustomerStory } from "@/components/landing/CustomerStory";
import { PricingSection } from "@/components/landing/PricingSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { Footer } from "@/components/landing/Footer";

export default async function Page() {
  const store = await cookies();
  const cookieValue = store.get(AB_VARIANT_COOKIE)?.value;
  const variant = isValidVariant(cookieValue) ? cookieValue : "A";
  const hero = HERO_VARIANTS[variant];

  return (
    <main className="relative isolate min-h-screen overflow-hidden">
      <LandingBackground />
      <Header ctaLabel={hero.primaryCta} />
      <Hero content={hero} />
      <FeaturesSection />
      <CustomerStory />
      <PricingSection />
      <FinalCta />
      <Footer />
    </main>
  );
}
