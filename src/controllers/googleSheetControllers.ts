import { Request, Response } from "express";
import { GoogleSheet } from "../services/GoogleSheetService";
import { Jotform, AcquisitionForm, ConsignmentForm } from "../helpers/Jotforms";

async function addNewProducts(req: Request, res: Response) {
  const inputs = req.body;
  const form = new Jotform(inputs);
  const formIdentity = form.identity();
  const gsheet = new GoogleSheet();
  
  try {
    const lastUsedRow = await gsheet.getLastUsedRowIndex(process.env.GOOGLE_SHEET_ID);
    if (formIdentity === "Acquisition") {

      const aquisitionForm = new AcquisitionForm(inputs);
      const formattedData: string[][] = aquisitionForm.getProductsWithAcquisitionDetails();
      const requiredRowsForGsheet = aquisitionForm.addCalculatedCellsInProductRows(formattedData, lastUsedRow);

      await gsheet.appendRowsOfProducts(process.env.GOOGLE_SHEET_ID, requiredRowsForGsheet);
    } else if (formIdentity === "Consignment") {

      const consignmentForm = new ConsignmentForm(inputs);
      const formattedData: string[][] = consignmentForm.getProductsWithConsignmentDetails();
      const requiredRowsForGsheet = consignmentForm.addCalculatedCellsInProductRows(formattedData, lastUsedRow);
      
      await gsheet.appendRowsOfProducts(process.env.GOOGLE_SHEET_ID, requiredRowsForGsheet); 
    } else {
      return res.send("unauthorized request.");
    }
    res.send("added products on google sheet");
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
}

async function getSpreadSheetValues(req: Request, res: Response) {
  try {
    const sheet = new GoogleSheet();
    const values = await sheet.getSpreadSheetValues(
      process.env.GOOGLE_SHEET_ID
    );
    res.send(values);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
}

const googleSheetControllers = {
  addNewProducts,
  getSpreadSheetValues,
};

export { googleSheetControllers };
