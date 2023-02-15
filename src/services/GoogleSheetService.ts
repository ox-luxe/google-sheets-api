import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";

class GoogleSheet {
  constructor() {}

  async getLastUsedRowIndex(spreadsheetId: string) {
    const auth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const service = google.sheets({ version: "v4", auth });
    try {
      const result = await service.spreadsheets.values.get({
        spreadsheetId,
        range: process.env.GOOGLE_SHEET_NAME + "!B:B",
      });      
      return result.data.values.length;
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  async getSpreadSheetValues(spreadsheetId: string) {
    const auth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const service = google.sheets({ version: "v4", auth });
    try {
      const result = await service.spreadsheets.values.get({
        spreadsheetId,
        range: process.env.GOOGLE_SHEET_NAME + "!A:A",
      });

      return result;
    } catch (err) {
      // TODO (developer) - Handle exception
      throw err;
    }
  }
  // only has 1 job. add data onto rows of google sheet 👍
  async appendRowsOfProducts(spreadsheetId: string, _values: string[][]) {
    const auth = new GoogleAuth({
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const service = google.sheets({ version: "v4", auth });
    // console.log(_values);

    try {
      const result = await service.spreadsheets.values.append({
        spreadsheetId,
        range: process.env.GOOGLE_SHEET_NAME + "!A:A",
        valueInputOption: "USER_ENTERED",
        insertDataOption: "INSERT_ROWS",
        includeValuesInResponse: true,
        responseValueRenderOption: "FORMATTED_VALUE",
        responseDateTimeRenderOption: "FORMATTED_STRING",
        requestBody: {
          majorDimension: "ROWS",
          values: _values,
        },
      });
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }
}

export { GoogleSheet };
