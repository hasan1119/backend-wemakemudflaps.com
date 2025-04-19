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

export default roles;
