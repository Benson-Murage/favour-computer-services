import jsPDF from "jspdf";

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
  items: Array<{ name: string; qty: number; price: number }>;
};

export type BusinessInfo = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  till_number?: string | null;
  paybill_number?: string | null;
  account_number?: string | null;
};

const KES = (n: number) => "KES " + Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 0 });

export function generateReceiptPdf(order: ReceiptOrder, biz: BusinessInfo, kind: "receipt" | "invoice" = "receipt") {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(biz.name ?? "Favour Computer Services", 50, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  y += 16;
  if (biz.address) { doc.text(biz.address, 50, y); y += 12; }
  if (biz.phone) { doc.text(`Tel: ${biz.phone}`, 50, y); y += 12; }
  if (biz.email) { doc.text(biz.email, 50, y); y += 12; }

  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(kind.toUpperCase(), W - 50, 60, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`No: ${order.invoice_number ?? order.id.slice(0, 8).toUpperCase()}`, W - 50, 78, { align: "right" });
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString("en-KE")}`, W - 50, 92, { align: "right" });
  doc.text(`Status: ${order.payment_status ?? order.status}`, W - 50, 106, { align: "right" });

  y = Math.max(y, 120) + 8;
  doc.setDrawColor(220);
  doc.line(50, y, W - 50, y);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Billed To", 50, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  y += 14;
  doc.text(order.customer_name, 50, y); y += 12;
  doc.text(order.customer_email, 50, y); y += 12;
  doc.text(order.customer_phone, 50, y); y += 12;
  if (order.delivery_address) { doc.text(`Address: ${order.delivery_address}`, 50, y); y += 12; }
  if (order.fulfillment) { doc.text(`Fulfillment: ${order.fulfillment}`, 50, y); y += 12; }
  if (order.reservation_number) { doc.text(`Reservation: ${order.reservation_number}  (Pickup code ${order.pickup_code ?? ""})`, 50, y); y += 12; }

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
    if (y > 760) { doc.addPage(); y = 60; }
    doc.text(String(it.name).slice(0, 60), 60, y + 14);
    doc.text(String(it.qty), W - 220, y + 14, { align: "right" });
    doc.text(KES(it.price), W - 140, y + 14, { align: "right" });
    doc.text(KES(it.price * it.qty), W - 60, y + 14, { align: "right" });
    y += 20;
    doc.setDrawColor(235);
    doc.line(50, y, W - 50, y);
  });

  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total", W - 140, y, { align: "right" });
  doc.text(KES(order.total), W - 60, y, { align: "right" });

  y += 36;
  if (biz.till_number || biz.paybill_number) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Payment", 50, y); y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (biz.till_number) { doc.text(`M-Pesa Till: ${biz.till_number}`, 50, y); y += 12; }
    if (biz.paybill_number) { doc.text(`M-Pesa Paybill: ${biz.paybill_number}${biz.account_number ? `  ·  Account ${biz.account_number}` : ""}`, 50, y); y += 12; }
  }

  y += 24;
  doc.setTextColor(120);
  doc.setFontSize(9);
  doc.text("Thank you for choosing Favour Computer Services.", 50, y);

  return doc;
}

export function downloadReceiptPdf(order: ReceiptOrder, biz: BusinessInfo, kind: "receipt" | "invoice" = "receipt") {
  const doc = generateReceiptPdf(order, biz, kind);
  doc.save(`${kind}-${order.invoice_number ?? order.id.slice(0, 8)}.pdf`);
}

export function printReceiptPdf(order: ReceiptOrder, biz: BusinessInfo, kind: "receipt" | "invoice" = "receipt") {
  const doc = generateReceiptPdf(order, biz, kind);
  const blob = doc.output("bloburl") as unknown as string;
  window.open(blob, "_blank");
}