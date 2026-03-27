const EASYBILL_BASE_URL = "https://api.easybill.de/rest/v1";

async function easybillFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${EASYBILL_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.EASYBILL_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Easybill API error: ${res.status} - ${error}`);
  }

  return res;
}

interface CreateInvoiceParams {
  customerName: string;
  customerEmail: string;
  courtName: string;
  date: string;
  startTime: number;
  endTime: number;
  totalPrice: number;
}

export async function createCustomer(name: string, email: string) {
  const nameParts = name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || name;

  const res = await easybillFetch("/customers", {
    method: "POST",
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      emails: [email],
    }),
  });

  return res.json();
}

export async function createInvoice(params: CreateInvoiceParams) {
  // First, create or find customer
  const customer = await createCustomer(params.customerName, params.customerEmail);

  const hours = params.endTime - params.startTime;

  const res = await easybillFetch("/documents", {
    method: "POST",
    body: JSON.stringify({
      type: "INVOICE",
      customer_id: customer.id,
      items: [
        {
          description: `Padel Court Buchung: ${params.courtName}\nDatum: ${params.date}\nZeit: ${params.startTime}:00 - ${params.endTime}:00 Uhr\nDauer: ${hours} Stunde(n)`,
          quantity: 1,
          single_price_net: Math.round(params.totalPrice * 100), // Easybill uses cents
          vat_percent: 19,
        },
      ],
    }),
  });

  const invoice = await res.json();

  // Finalize the invoice
  await easybillFetch(`/documents/${invoice.id}/done`, {
    method: "PUT",
  });

  return invoice;
}

export async function sendInvoiceByEmail(invoiceId: number) {
  await easybillFetch(`/documents/${invoiceId}/send/email`, {
    method: "POST",
    body: JSON.stringify({
      subject: "Ihre Padel Court Buchungsrechnung",
      message:
        "Vielen Dank für Ihre Buchung! Anbei finden Sie Ihre Rechnung.",
    }),
  });
}
