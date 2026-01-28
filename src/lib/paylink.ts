export class PaylinkService {
    private static baseUrl = process.env.PAYLINK_BASE_URL || 'https://restapi.paylink.sa';
    private static apiId = process.env.PAYLINK_API_ID;
    private static secretKey = process.env.PAYLINK_SECRET_KEY;

    private static async getAuthToken(): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                apiId: this.apiId,
                secretKey: this.secretKey,
                persistToken: false,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Paylink Auth Error:', errorText);
            throw new Error('Failed to authenticate with Paylink');
        }

        const data = await response.json();
        return data.id_token;
    }

    static async createInvoice(details: {
        amount: number;
        clientName: string;
        clientEmail: string;
        clientMobile: string;
        callbackUrl: string;
        cancelUrl?: string;
        orderNumber: string;
        products: { title: string; price: number; qty: number }[];
    }) {
        const token = await this.getAuthToken();

        const response = await fetch(`${this.baseUrl}/api/addInvoice`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'accept': 'application/json',
            },
            body: JSON.stringify({
                amount: details.amount,
                clientName: details.clientName,
                clientEmail: details.clientEmail,
                clientMobile: details.clientMobile,
                callBackUrl: details.callbackUrl,
                cancelUrl: details.cancelUrl,
                orderNumber: details.orderNumber,
                products: details.products,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Paylink Create Invoice Error:', errorText);
            throw new Error('Failed to create Paylink invoice');
        }

        return await response.json();
    }

    static async getInvoiceStatus(transactionNo: string) {
        const token = await this.getAuthToken();

        const response = await fetch(`${this.baseUrl}/api/getInvoice/${transactionNo}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Paylink Get Invoice Error:', errorText);
            throw new Error('Failed to get Paylink invoice status');
        }

        return await response.json();
    }
}
