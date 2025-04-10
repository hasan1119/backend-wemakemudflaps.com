import { AppDataSource, connectDB } from "../config/db";

const seed = async () => {
  await connectDB();

  const faqRepo = AppDataSource.getRepository(Faq);
  const privacyRepo = AppDataSource.getRepository(PrivacyPolicy);
  const shippingRepo = AppDataSource.getRepository(ShippingClass);

  try {
    console.log("Seeding FAQs...");
    await faqRepo.save(faqs);

    console.log("Seeding Privacy Policies...");
    await privacyRepo.save(privacyPolicies);

    console.log("Seeding Shipping Classes...");
    await shippingRepo.save(shippingClasses);

    console.log("✅ Seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
