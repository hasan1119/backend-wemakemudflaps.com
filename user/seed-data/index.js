import { Role } from "../../entities";
import { AppDataSource, connectDB } from "../src/helper";
import roles from "./data/user-role";

const seed = async () => {
  await connectDB();

  const userRoleRepo = AppDataSource.getRepository(Role);

  try {
    console.log("Seeding Roles...");

    for (const role of roles) {
      const existing = await userRoleRepo.findOne({
        where: { name: role.name },
      });

      if (!existing) {
        await userRoleRepo.save(role);
        console.log(`✔️  Inserted role: ${role.name}`);
      } else {
        console.log(`⚠️  Role already exists: ${role.name}`);
      }
    }

    console.log("✅ Role seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
