import crypto from "crypto";

export interface CorefyCustomerAddress {
  country?: string;
  city?: string;
  region?: string;
  street?: string;
  post_code?: string;
  full_address?: string;
}

export interface CorefyCustomer {
  reference_id?: string;
  email: string;
  name?: string;
  first_name?: string;
  surname?: string;
  phone?: string;
  address?: CorefyCustomerAddress;
  metadata?: Record<string, any>;
}

export interface CreateInvoiceParams {
  referenceId: string;
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  returnUrls?: {
    success?: string;
    pending?: string;
    fail?: string;
  };
  callbackUrl: string;
  customer: CorefyCustomer;
  metadata?: Record<string, any>;
  testMode?: boolean;
}

export interface CreateInvoiceResult {
  success: boolean;
  invoiceId: string;
  redirectUrl: string;
  raw: any;
}

const COUNTRY_MAP: Record<string, string> = {
  latvia: "LV",
  "united kingdom": "GB",
  uk: "GB",
  "great britain": "GB",
  britain: "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "united states": "US",
  usa: "US",
  us: "US",
  germany: "DE",
  deutschland: "DE",
  france: "FR",
  spain: "ES",
  italy: "IT",
  netherlands: "NL",
  poland: "PL",
  lithuania: "LT",
  estonia: "EE",
  turkey: "TR",
  türkiye: "TR",
  japan: "JP",
  canada: "CA",
  australia: "AU",
  ireland: "IE",
  switzerland: "CH",
  austria: "AT",
  belgium: "BE",
  sweden: "SE",
  norway: "NO",
  denmark: "DK",
  finland: "FI",
  portugal: "PT",
  greece: "GR",
  "czech republic": "CZ",
  czechia: "CZ",
  romania: "RO",
  hungary: "HU",
  cyprus: "CY",
  malta: "MT",
  bulgaria: "BG",
  croatia: "HR",
  slovakia: "SK",
  slovenia: "SI",
  luxembourg: "LU",
};

export function normalizeCountryCode(country?: string): string | undefined {
  if (!country) return undefined;
  const trimmed = country.trim();
  if (trimmed.length === 2) {
    return trimmed.toUpperCase();
  }
  const mapped = COUNTRY_MAP[trimmed.toLowerCase()];
  if (mapped) return mapped;
  // If unknown and longer than 2 characters, omit to prevent validation error
  return undefined;
}

export class CorefyClient {
  private baseUrl: string;
  private commerceAccountId: string;
  private privateApiKey: string;
  private signatureKey: string;
  private defaultTestMode: boolean;

  constructor() {
    this.baseUrl = (
      process.env.COREFY_BASE_URL || "https://api.sterling-pay.com"
    ).replace(/\/+$/, "");

    this.commerceAccountId =
      process.env.COREFY_COMMERCE_ACCOUNT_ID ||
      process.env.COREFY_ACCOUNT_ID ||
      "";

    this.privateApiKey =
      process.env.COREFY_PRIVATE_API_KEY ||
      process.env.COREFY_API_KEY ||
      "";

    this.signatureKey =
      process.env.COREFY_SIGNATURE_API_KEY ||
      process.env.COREFY_WEBHOOK_SECRET ||
      "";

    this.defaultTestMode =
      process.env.COREFY_TEST_MODE !== undefined
        ? process.env.COREFY_TEST_MODE === "true"
        : process.env.NODE_ENV !== "production";
  }

  private getAuthHeader(): string {
    const credentials = `${this.commerceAccountId}:${this.privateApiKey}`;
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
  }

  /**
   * Verify HMAC-SHA256 signature from incoming webhook headers
   */
  public verifySignature(rawBody: string, incomingSig?: string | null): boolean {
    if (!this.signatureKey) {
      console.warn("⚠️ COREFY_SIGNATURE_API_KEY not configured. Skipping signature check.");
      return true;
    }

    if (!incomingSig) {
      return false;
    }

    try {
      const calculatedSig = crypto
        .createHmac("sha256", this.signatureKey)
        .update(rawBody)
        .digest("hex");

      const calculatedBuf = Buffer.from(calculatedSig, "utf8");
      const incomingBuf = Buffer.from(incomingSig, "utf8");

      if (calculatedBuf.length !== incomingBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(calculatedBuf, incomingBuf);
    } catch (err) {
      console.error("❌ Error calculating Corefy webhook HMAC:", err);
      return false;
    }
  }

  /**
   * Create a Hosted Payment Page (HPP) invoice with Sterling Pay / Corefy
   */
  public async createPaymentInvoice(
    params: CreateInvoiceParams
  ): Promise<CreateInvoiceResult> {
    const currencyUpper = params.currency.toUpperCase();
    const currencyLower = params.currency.toLowerCase();
    const isTestMode =
      params.testMode !== undefined ? params.testMode : this.defaultTestMode;

    // Enforce required customer metadata: shop = workingagent
    const customerMetadata = {
      shop: "workingagent",
      ...(params.customer.metadata || {}),
    };

    const topMetadata = {
      order_id: params.referenceId,
      shop: "workingagent",
      ...(params.metadata || {}),
    };

    // Sanitize address: ensure country is valid ISO 3166-1 alpha-2 or omitted
    let sanitizedAddress: CorefyCustomerAddress | undefined = undefined;
    if (params.customer.address) {
      const addr = params.customer.address;
      const normalizedCountry = normalizeCountryCode(addr.country);
      sanitizedAddress = {
        city: addr.city || undefined,
        street: addr.street || undefined,
        post_code: addr.post_code || undefined,
        region: addr.region || undefined,
        full_address: addr.full_address || undefined,
        ...(normalizedCountry ? { country: normalizedCountry } : {}),
      };
      if (Object.keys(sanitizedAddress).length === 0) {
        sanitizedAddress = undefined;
      }
    }

    const payload = {
      data: {
        type: "payment-invoices",
        attributes: {
          reference_id: params.referenceId,
          amount: Number(params.amount),
          currency: currencyUpper,
          service: `payment_card_${currencyLower}_hpp`,
          flow: "charge",
          test_mode: isTestMode,
          description: params.description,
          return_url: params.returnUrl,
          return_urls: params.returnUrls || {
            success: params.returnUrl,
            pending: params.returnUrl,
            fail: params.returnUrl,
          },
          callback_url: params.callbackUrl,
          customer: {
            reference_id: params.customer.reference_id,
            email: params.customer.email,
            name: params.customer.name,
            first_name: params.customer.first_name,
            surname: params.customer.surname,
            phone: params.customer.phone,
            address: sanitizedAddress,
            metadata: customerMetadata,
          },
          metadata: topMetadata,
        },
      },
    };

    console.log(
      `💳 Creating Corefy invoice for ${params.referenceId} (${params.amount} ${currencyUpper})...`
    );

    const res = await fetch(`${this.baseUrl}/payment-invoices`, {
      method: "POST",
      headers: {
        Authorization: this.getAuthHeader(),
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg =
        responseData?.errors?.map((e: any) => `${e.title || e.detail} (${e.source?.pointer || ""})`).join("; ") ||
        responseData?.errors?.[0]?.detail ||
        responseData?.errors?.[0]?.title ||
        JSON.stringify(responseData?.errors || responseData) ||
        `HTTP ${res.status}`;
      console.error("❌ Corefy invoice creation failed:", errorMsg, JSON.stringify(responseData?.errors));
      throw new Error(`Corefy error: ${errorMsg}`);
    }

    const redirectUrl =
      responseData?.data?.attributes?.flow_data?.action ||
      responseData?.data?.attributes?.hpp_url;
    const invoiceId = responseData?.data?.id;

    if (!redirectUrl) {
      console.error(
        "❌ Corefy response missing redirect URL:",
        JSON.stringify(responseData)
      );
      throw new Error("Corefy did not return a valid redirect/HPP URL");
    }

    return {
      success: true,
      invoiceId,
      redirectUrl,
      raw: responseData,
    };
  }

  /**
   * Check status of an invoice via GET /payment-invoices/{invoiceId}
   */
  public async getInvoice(invoiceId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/payment-invoices/${invoiceId}`, {
      method: "GET",
      headers: {
        Authorization: this.getAuthHeader(),
        Accept: "application/vnd.api+json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Corefy invoice status check failed (${res.status}): ${errorText}`
      );
    }

    return res.json();
  }
}

export const corefyClient = new CorefyClient();
