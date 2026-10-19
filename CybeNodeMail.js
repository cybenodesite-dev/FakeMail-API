import fetch from 'node-fetch';

export class CybeNodeMail {
  constructor(baseUrl = "https://fakemail-api.cybenode-site.workers.dev") {
    this.baseUrl = baseUrl;
    this.token = null;
    this.address = null;
    this.password = null;
  }

  async getDomains() {
    const res = await fetch(`${this.baseUrl}/domains`);
    if (!res.ok) throw new Error("فشل جلب النطاقات من الخادم");
    const data = await res.json();
    return data["hydra:member"] || data;
  }

  async createRandomAccount() {
    const domains = await this.getDomains();
    if (!domains || domains.length === 0) throw new Error("لا توجد نطاقات متاحة");
    
    const domain = typeof domains[0] === 'string' ? domains[0] : domains[0].domain;
    const prefix = "cli_" + Math.random().toString(36).substring(2, 8);
    const address = `${prefix}@${domain}`;
    const password = "Pw_" + Math.random().toString(36).substring(2, 9);

    const accRes = await fetch(`${this.baseUrl}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
    });

    if (!accRes.ok) throw new Error("فشل إنشاء الحساب البريدي");

    const tokenRes = await fetch(`${this.baseUrl}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, password }),
    });

    const tokenData = await tokenRes.json();
    this.address = address;
    this.password = password;
    this.token = tokenData.token;

    return { address, password, token: this.token };
  }

  async getMessages(token = this.token) {
    if (!token) throw new Error("التوكين مفقود، يرجى إنشاء حساب أولاً");
    const res = await fetch(`${this.baseUrl}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("تعذر جلب الرسائل من الخادم");
    const data = await res.json();
    return data["hydra:member"] || data;
  }
}
