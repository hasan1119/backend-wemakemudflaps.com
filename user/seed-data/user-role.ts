import { Role } from "../src/entities/user-role.entity";
import { AppDataSource, redis } from "../src/helper";
import {
  getSingleUserRoleCacheKey,
  getSingleUserRoleInfoByNameCacheKey,
} from "../src/helper/redis/session-keys";

const roles = [
  {
    name: "SUPER ADMIN",
    description:
      "Has full control over all aspects of the eCommerce platform. Can manage users, orders, products, and settings.",
    createdBy: null,
  },
  {
    name: "ADMIN",
    description:
      "Has full control over all aspects of the eCommerce platform. Can manage users, orders, products, and settings. But super admin can intercept the access.",
    createdBy: null,
  },
  {
    name: "VENDOR",
    description:
      "Can manage their own products, view and process orders, and manage inventory.",
    createdBy: null,
  },
  {
    name: "INVENTORY MANAGER",
    description:
      "Responsible for managing the inventory, including adding, updating, and tracking stock levels.",
    createdBy: null,
  },
  {
    name: "CUSTOMER SUPPORT",
    description: "Assists customers with inquiries, order issues, and returns.",
    createdBy: null,
  },
  {
    name: "SALES MANAGER",
    description:
      "Manages sales performance, sets pricing, and oversees promotional campaigns.",
    createdBy: null,
  },
  {
    name: "MARKETING MANAGER",
    description:
      "Handles marketing campaigns, promotions, and customer outreach strategies.",
    createdBy: null,
  },
  {
    name: "CUSTOMER",
    description:
      "Regular customers who can browse products, place orders, and view their purchase history.",
    createdBy: null,
  },
  {
    name: "CONTENT EDITOR",
    description:
      "Responsible for editing and managing the content on the site, such as product descriptions, blog posts, and promotional banners.",
    createdBy: null,
  },
  {
    name: "SHIPPING MANAGER",
    description:
      "Manages the shipping process, including order fulfillment and tracking shipments.",
    createdBy: null,
  },
];

export async function seedRoles() {
  const { setSession, getSession } = redis;

  try {
    const roleRepository = AppDataSource.getRepository(Role);

    for (const roleData of roles) {
      const cacheKey = getSingleUserRoleInfoByNameCacheKey(
        roleData.name.toLowerCase()
      );

      // First: Try to get from Redis
      let existingRole = await getSession<Role>(cacheKey);

      if (!existingRole) {
        // If not found in Redis, check in database
        existingRole = await roleRepository.findOne({
          where: { name: roleData.name },
        });

        if (!existingRole) {
          // If not found in database, create and save new role
          const newRole = roleRepository.create(roleData);
          await roleRepository.save(newRole);

          // Cache newly created user role in Redis with configurable TTL(default 30 days of redis session because of the env)
          await setSession(cacheKey, newRole);
          await setSession(getSingleUserRoleCacheKey(newRole.id), newRole);

          console.log(`✅ Seeded role: ${roleData.name}`);
        } else {
          // If found in DB but not in Redis, user role in Redis with configurable TTL(default 30 days of redis session because of the env)
          await setSession(cacheKey, existingRole);
          await setSession(existingRole.id, existingRole);
          console.log(`ℹ️ Role already exists in DB: ${roleData.name}`);
        }
      }
    }

    console.log("🌱 Role seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
  }
}
