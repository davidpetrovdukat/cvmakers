export class PionPayClient {
  private publicId: string;
  private apiSecret: string;
  private apiUrl: string;
  private redirectBaseUrl: string;

  constructor() {
    this.publicId = process.env.PIONPAY_PUBLIC_ID || "";
    this.apiSecret = process.env.PIONPAY_API_SECRET || "";
    this.apiUrl = process.env.PIONPAY_API_URL || "https://api.pionpay.com";
    this.redirectBaseUrl = process.env.PIONPAY_REDIRECT_BASE_URL || "https://api.pionpay.com/payments/redirect";
  }

  /**
   * Generates basic auth header credentials
   */
  private getAuthHeader() {
    const credentials = `${this.publicId}:${this.apiSecret}`;
    const encoded = Buffer.from(credentials).toString("base64");
    return {
      "Authorization": `Basic ${encoded}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Constructs the hosted redirect URL for payment initiation
   */
  public getRedirectUrl(params: {
    amount: number;
    description: string;
    currency: string;
    invoiceId: string;
    accountId: string;
    successUrl: string;
    failureUrl: string;
    pendingUrl: string;
    cancelUrl: string;
    locale?: string;
  }): string {
    const url = new URL(`${this.redirectBaseUrl}/${this.publicId}`);
    
    url.searchParams.append("amount", params.amount.toFixed(2));
    url.searchParams.append("description", params.description);
    url.searchParams.append("currency", params.currency);
    url.searchParams.append("invoiceId", params.invoiceId);
    url.searchParams.append("accountId", params.accountId);
    url.searchParams.append("successUrl", params.successUrl);
    url.searchParams.append("failureUrl", params.failureUrl);
    url.searchParams.append("pendingUrl", params.pendingUrl);
    url.searchParams.append("cancelUrl", params.cancelUrl);
    
    if (params.locale) {
      url.searchParams.append("locale", params.locale);
    }

    return url.toString();
  }

  /**
   * Checks the status of transaction(s) by invoiceId (orderMerchantId)
   * POST https://api.pionpay.com/payments/status/invoice
   */
  public async checkStatusInvoice(invoiceId: string) {
    const url = `${this.apiUrl}/payments/status/invoice`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({ invoiceId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`PionPay invoice status check failed: ${res.status} - ${errorText}`);
    }

    return res.json();
  }

  /**
   * Checks the status of a specific transaction ID
   * POST https://api.pionpay.com/payments/status
   */
  public async checkStatus(transactionId: number) {
    const url = `${this.apiUrl}/payments/status`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({ transactionId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`PionPay transaction status check failed: ${res.status} - ${errorText}`);
    }

    return res.json();
  }

  /**
   * Refunds a transaction
   * POST https://api.pionpay.com/payments/refund
   */
  public async refund(transactionId: number, amount?: number) {
    const url = `${this.apiUrl}/payments/refund`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify({
        transactionId,
        ...(amount !== undefined && { amount }),
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`PionPay refund failed: ${res.status} - ${errorText}`);
    }

    return res.json();
  }
}
