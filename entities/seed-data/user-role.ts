const roles = [
  {
    name: "Super Admin",
    description:
      "Has full control over all aspects of the eCommerce platform. Can manage users, orders, products, and settings.",
    createdBy: null,
  },
  {
    name: "Admin",
    description:
      "Has full control over all aspects of the eCommerce platform. Can manage users, orders, products, and settings. But super admin can intercept the access.",
    createdBy: null,
  },
  {
    name: "Vendor",
    description:
      "Can manage their own products, view and process orders, and manage inventory.",
    createdBy: null,
  },
  {
    name: "Inventory Manager",
    description:
      "Responsible for managing the inventory, including adding, updating, and tracking stock levels.",
    createdBy: null,
  },
  {
    name: "Customer Support",
    description: "Assists customers with inquiries, order issues, and returns.",
    createdBy: null,
  },
  {
    name: "Sales Manager",
    description:
      "Manages sales performance, sets pricing, and oversees promotional campaigns.",
    createdBy: null,
  },
  {
    name: "Marketing Manager",
    description:
      "Handles marketing campaigns, promotions, and customer outreach strategies.",
    createdBy: null,
  },
  {
    name: "Customer",
    description:
      "Regular customers who can browse products, place orders, and view their purchase history.",
    createdBy: null,
  },
  {
    name: "Content Editor",
    description:
      "Responsible for editing and managing the content on the site, such as product descriptions, blog posts, and promotional banners.",
    createdBy: null,
  },
  {
    name: "Shipping Manager",
    description:
      "Manages the shipping process, including order fulfillment and tracking shipments.",
    createdBy: null,
  },
];

export default roles;
