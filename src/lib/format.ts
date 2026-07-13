export const formatPrice = (n: number | string) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(typeof n === "string" ? parseFloat(n) : n);

export const conditionLabel = (c: string) => {
  switch (c) {
    case "new":
      return "New";
    case "certified_refurbished":
      return "Certified Refurbished";
    case "refurbished_a":
      return "Refurbished · Grade A";
    case "refurbished_b":
      return "Refurbished · Grade B";
    case "open_box":
      return "Open Box";
    default:
      return c;
  }
};
