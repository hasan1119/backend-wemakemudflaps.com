const taxStatuses = [
  {
    value: "Taxable",
    description:
      "The product is subject to tax based on the applicable tax class.",
    createdBy: null, // You can assign a specific user as the creator if needed
  },
  {
    value: "Shipping only",
    description:
      "The product is not taxable, but the shipping fee may be taxable.",
    createdBy: null,
  },
  {
    value: "None",
    description:
      "The product is not taxable and does not require a tax status.",
    createdBy: null,
  },
  // Custom tax status examples
  // {
  //   value: "Tax-exempt",
  //   description:
  //     "The product is exempt from tax due to being tax-exempt or for specific users.",
  //   createdBy: null,
  // },
  // {
  //   value: "Duty-Free",
  //   description:
  //     "The product is exempt from duty taxes due to international trade agreements.",
  //   createdBy: null,
  // },
];

export default taxStatuses;
