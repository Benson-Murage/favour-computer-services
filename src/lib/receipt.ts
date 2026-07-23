import jsPDF from "jspdf";
import logoAsset from "@/assets/fcs-logo.png";

let LOGO_DATA_URL: string | null = null;
let LOGO_DIMS: { w: number; h: number } | null = null;
async function loadLogo() {
  if (LOGO_DATA_URL) return { url: LOGO_DATA_URL, dims: LOGO_DIMS! };
  try {
    const res = await fetch(logoAsset);
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ w: img.width, h: img.height });
      img.onerror = () => resolve({ w: 1024, h: 1024 });
      img.src = dataUrl;
    });
    LOGO_DATA_URL = dataUrl;
    LOGO_DIMS = dims;
    return { url: dataUrl, dims };
  } catch {
    return null;
  }
}

export type ReceiptOrder = {
  invoice_number: string | null;
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  fulfillment: string | null;
  delivery_address?: string | null;
  total: number;
  subtotal: number;
  status: string;
  payment_status?: string;
  reservation_number?: string | null;
  pickup_code?: string | null;
  items: Array<{
    name: string;
    qty: number;
    price: number;
    product_id?: string;
    serial?: string;
    imei?: string;
  }>;
  verification_code?: string;
  verify_url?: string;
  qr_data_url?: string;
  product_specs?: Record<
    string,
    { processor?: string; ram?: string; storage?: string; warranty?: string; condition?: string }
  >;
};

export type BusinessInfo = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  till_number?: string | null;
  paybill_number?: string | null;
  account_number?: string | null;
  signature_url?: string | null;
  stamp_url?: string | null;
  signatory_name?: string | null;
  signatory_title?: string | null;
  website_url?: string | null;
  bank_name?: string | null;
  bank_account?: string | null;
};

const KES = (n: number) =>
  "KES " + Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 0 });

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function specLine(specs: NonNullable<ReceiptOrder["product_specs"]>[string] | undefined): string {
  if (!specs) return "";
  const parts: string[] = [];
  if (specs.processor) parts.push(specs.processor);
  if (specs.ram) parts.push(`${specs.ram} RAM`);
  if (specs.storage) parts.push(specs.storage);
  if (specs.condition) parts.push(specs.condition);
  return parts.join(" · ");
}

function warrantyLine(
  specs: NonNullable<ReceiptOrder["product_specs"]>[string] | undefined,
): string {
  if (!specs?.warranty || /none|no\s*war/i.test(specs.warranty)) return "No manufacturer warranty";
  return `Warranty: ${specs.warranty}`;
}

export async function generateReceiptPdf(
  order: ReceiptOrder,
  biz: BusinessInfo,
  kind: "receipt" | "invoice" = "receipt",
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 50;

  const logo = await loadLogo();
  let headerLeft = 50;
  if (logo) {
    const targetH = 46;
    const ratio = logo.dims.w / logo.dims.h;
    const targetW = targetH * ratio;
    try {
      doc.addImage(logo.url, "PNG", 50, y - 20, targetW, targetH);
    } catch {
      /* empty */
    }
    headerLeft = 50 + targetW + 12;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(biz.name ?? "Favour Computer Services", headerLeft, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  y += 16;
  if (biz.address) {
    doc.text(biz.address, headerLeft, y);
    y += 12;
  }
  if (biz.phone) {
    doc.text(`Tel: ${biz.phone}`, headerLeft, y);
    y += 12;
  }
  if (biz.email) {
    doc.text(biz.email, headerLeft, y);
    y += 12;
  }
  if (biz.website_url) {
    doc.text(biz.website_url, headerLeft, y);
    y += 12;
  }
  y = Math.max(y, 90);

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(kind.toUpperCase(), W - 50, 60, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`No: ${order.invoice_number ?? order.id.slice(0, 8).toUpperCase()}`, W - 50, 78, {
    align: "right",
  });
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString("en-KE")}`, W - 50, 92, {
    align: "right",
  });
  doc.text(`Status: ${order.payment_status ?? order.status}`, W - 50, 106, { align: "right" });
  if (order.verification_code) {
    doc.setFont("helvetica", "bold");
    doc.text(`Verify: ${order.verification_code}`, W - 50, 120, { align: "right" });
    doc.setFont("helvetica", "normal");
  }

  y = Math.max(y, 132) + 8;
  doc.setDrawColor(220);
  doc.line(50, y, W - 50, y);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Billed To", 50, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 14;
  doc.text(order.customer_name, 50, y);
  y += 12;
  doc.text(order.customer_email, 50, y);
  y += 12;
  doc.text(order.customer_phone, 50, y);
  y += 12;
  if (order.delivery_address) {
    doc.text(`Address: ${order.delivery_address}`, 50, y);
    y += 12;
  }
  if (order.fulfillment) {
    doc.text(`Fulfillment: ${order.fulfillment}`, 50, y);
    y += 12;
  }
  if (order.reservation_number) {
    doc.text(
      `Reservation: ${order.reservation_number}  (Pickup code ${order.pickup_code ?? ""})`,
      50,
      y,
    );
    y += 12;
  }

  y += 12;
  doc.setFillColor(245, 245, 245);
  doc.rect(50, y, W - 100, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text("Item", 60, y + 15);
  doc.text("Qty", W - 220, y + 15, { align: "right" });
  doc.text("Price", W - 140, y + 15, { align: "right" });
  doc.text("Subtotal", W - 60, y + 15, { align: "right" });
  y += 22;

  doc.setTextColor(30);
  doc.setFont("helvetica", "normal");
  order.items.forEach((it) => {
    if (y > 720) {
      doc.addPage();
      y = 60;
    }
    const specs = it.product_id ? order.product_specs?.[it.product_id] : undefined;
    const line = specLine(specs);
    const war = warrantyLine(specs);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(String(it.name).slice(0, 70), 60, y + 14);
    doc.setFont("helvetica", "normal");
    doc.text(String(it.qty), W - 220, y + 14, { align: "right" });
    doc.text(KES(it.price), W - 140, y + 14, { align: "right" });
    doc.text(KES(it.price * it.qty), W - 60, y + 14, { align: "right" });
    y += 16;
    if (line) {
      doc.setFontSize(8);
      doc.setTextColor(110);
      doc.text(line, 60, y + 10);
      y += 12;
    }
    const details: string[] = [];
    if (it.serial) details.push(`SN: ${it.serial}`);
    if (it.imei) details.push(`IMEI: ${it.imei}`);
    if (details.length) {
      doc.setFontSize(8);
      doc.setTextColor(110);
      doc.text(details.join("  ·  "), 60, y + 10);
      y += 12;
    }
    doc.setFontSize(8);
    doc.setTextColor(140);
    doc.text(war, 60, y + 10);
    y += 14;
    doc.setTextColor(30);
    doc.setFontSize(10);
    doc.setDrawColor(235);
    doc.line(50, y, W - 50, y);
  });

  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total", W - 140, y, { align: "right" });
  doc.text(KES(order.total), W - 60, y, { align: "right" });

  y += 36;
  if (biz.till_number || biz.paybill_number || biz.bank_name) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Payment", 50, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (biz.till_number) {
      doc.text(`M-Pesa Till: ${biz.till_number}`, 50, y);
      y += 12;
    }
    if (biz.paybill_number) {
      doc.text(
        `M-Pesa Paybill: ${biz.paybill_number}${biz.account_number ? `  ·  Account ${biz.account_number}` : ""}`,
        50,
        y,
      );
      y += 12;
    }
    if (biz.bank_name) {
      doc.text(
        `Bank: ${biz.bank_name}${biz.bank_account ? `  ·  Acc ${biz.bank_account}` : ""}`,
        50,
        y,
      );
      y += 12;
    }
  }

  y += 24;
  // Signature + stamp block
  if (y > 640) {
    doc.addPage();
    y = 60;
  }
  const colW = (W - 100) / 2;
  const [sigData, stampData] = await Promise.all([
    biz.signature_url ? fetchAsDataUrl(biz.signature_url) : Promise.resolve(null),
    biz.stamp_url ? fetchAsDataUrl(biz.stamp_url) : Promise.resolve(null),
  ]);
  if (sigData) {
    try {
      doc.addImage(sigData, "PNG", 50, y - 4, colW - 40, 46);
    } catch {
      /* empty */
    }
  }
  if (stampData) {
    try {
      doc.addImage(stampData, "PNG", 50 + colW + 20, y - 6, 60, 60);
    } catch {
      /* empty */
    }
  }
  doc.setDrawColor(200);
  doc.line(50, y + 44, 50 + colW - 20, y + 44);
  doc.line(50 + colW + 20, y + 44, W - 50, y + 44);
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text("Authorized Signature", 50, y + 58);
  doc.text("Company Stamp", 50 + colW + 20, y + 58);
  if (biz.signatory_name) {
    doc.setFontSize(9);
    doc.setTextColor(30);
    doc.text(biz.signatory_name, 50, y + 70);
  }
  if (biz.signatory_title) {
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(biz.signatory_title, 50, y + 80);
  }
  y += 96;

  doc.setTextColor(90);
  doc.setFontSize(9);
  doc.text(`Date Issued: ${new Date().toLocaleDateString("en-KE")}`, 50, y);
  y += 18;

  // Verification QR block
  if (order.qr_data_url && order.verification_code) {
    if (y > 720) {
      doc.addPage();
      y = 60;
    }
    try {
      doc.addImage(order.qr_data_url, "PNG", W - 130, y - 4, 80, 80);
    } catch {
      /* empty */
    }
    doc.setFontSize(9);
    doc.setTextColor(30);
    doc.text("Verify this receipt", 50, y + 10);
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text(`Scan the QR or visit:`, 50, y + 24);
    if (order.verify_url) doc.text(order.verify_url, 50, y + 36);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30);
    doc.text(`Code: ${order.verification_code}`, 50, y + 52);
    doc.setFont("helvetica", "normal");
    y += 90;
  }

  doc.setTextColor(120);
  doc.setFontSize(9);
  doc.text("Thank you for choosing Favour Computer Services.", 50, y);
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "This is a computer-generated document and does not require a physical signature.",
    50,
    y + 12,
  );

  return doc;
}

export async function downloadReceiptPdf(
  order: ReceiptOrder,
  biz: BusinessInfo,
  kind: "receipt" | "invoice" = "receipt",
) {
  const doc = await generateReceiptPdf(order, biz, kind);
  doc.save(`${kind}-${order.invoice_number ?? order.id.slice(0, 8)}.pdf`);
}

export async function printReceiptPdf(
  order: ReceiptOrder,
  biz: BusinessInfo,
  kind: "receipt" | "invoice" = "receipt",
) {
  const doc = await generateReceiptPdf(order, biz, kind);
  const blob = doc.output("bloburl") as unknown as string;
  window.open(blob, "_blank");
}
