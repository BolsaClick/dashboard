// lib/sheets.ts
import { google } from "googleapis";

export async function appendErrorRow(row: any[]) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    const spreadsheetId = process.env.ERROR_SHEET_ID;
console.log(process.env.GOOGLE_PRIVATE_KEY);

    if (!clientEmail || !privateKey || !spreadsheetId) {
      console.error("❌ Faltam variáveis do Google Sheets no .env");
      return;
    }

const auth = new google.auth.JWT({
  email: clientEmail,
  key: privateKey,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Erros!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: [row],
      },
    });

    console.log("📄 Linha adicionada no Google Sheets:", row);

  } catch (error: any) {
    console.error("❌ Erro ao escrever no Google Sheets:", error?.message);
  }
}
