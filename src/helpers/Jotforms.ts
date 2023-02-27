import { Merchandiser } from "../models/Merchandiser";
import { RunningNumberSKU } from "../models/RunningNumberSKU";
import { Product } from "../models/Product";
import { getMonthName } from "./getMonthName";
import { convertNumberToThreeDigitString } from "./convertNumberToThreeDigitString";
import { sanitiseFormFieldIds } from "./sanitiseFormFieldIds";
import {
  ConsignmentProduct,
  AcquisitionProduct,
  InboundProducts,
} from "../interfaces/Products.interface";

interface Jotform {
  formID: string;
  formTitle: string;
  rawRequest: string;
}

class Jotform {
  data: Jotform;
  inboundProducts: InboundProducts;

  constructor(data: Jotform) {
    this.data = data;
    this.inboundProducts = sanitiseFormFieldIds(JSON.parse(this.data.rawRequest));
  }
  identity() {
    if (
      this.data.formID === process.env.JOTFORM_CONSIGNMENT_FORM_ID &&
      this.data.formTitle.toLowerCase().includes("consignment form")
    ) {
      return "Consignment";
    } else if (
      this.data.formID === process.env.JOTFORM_ACQUISITION_FORM_ID &&
      this.data.formTitle.toLowerCase().includes("acquisition form")
    ) {
      return "Acquisition";
    } else {
      return;
    }
  }
  getFormSubmissionReference() {
    return this.inboundProducts.formId5;
  }
  // methods to extract common product attributes from both forms
  getId() {
    return this.inboundProducts.slug.split("/")[1];
  }
  getSellerName() {
    return this.inboundProducts.sellersName;
  }
  getSellerContact() {
    return this.inboundProducts.sellersContact;
  }
  getSellerId() {
    return this.inboundProducts.sellersId;
  }
  getSellerAddress() {
    return this.inboundProducts.sellersAddress;
  }
  getSellerEmail() {
    return this.inboundProducts.sellersEmail;
  }
  getHandoverDate() {
    return (
      this.inboundProducts.handoverDate.day +
      "-" +
      getMonthName(this.inboundProducts.handoverDate.month) +
      "-" +
      this.inboundProducts.handoverDate.year
    );
  }
  getProductDetails() {
    return JSON.parse(this.inboundProducts.test);
  }
  getProductAdditionalItemsStatus(
    prod: ConsignmentProduct | AcquisitionProduct
  ) {
    // item order is important and must match google sheet item order
    const POSSIBLE_ADDITIONAL_ITEMS = [
      "Authenticity Card",
      "Care Card",
      "Dust Bag",
      "Original Box",
      "Paper Bag",
      "Receipt(s)",
    ];

    const status: string[] = [];
    const additionalItemsOfproduct = prod["Additional items"].split("\n");

    POSSIBLE_ADDITIONAL_ITEMS.forEach((POSSIBLE_ITEM) => {
      if (additionalItemsOfproduct.includes(POSSIBLE_ITEM)) {
        status.push("Y");
      } else {
        status.push("N");
      }
    });
    return status;
  }
  getProductAdditionalItemsList(additionalItemsStatus: string[]) {
    let list = "";
    const POSSIBLE_ADDITIONAL_ITEMS = [
      "Authenticity Card",
      "Care Card",
      "Dust Bag",
      "Original Box",
      "Paper Bag",
      "Receipt(s)",
    ];
    for (let i = 0; i < POSSIBLE_ADDITIONAL_ITEMS.length; i++) {
      if (additionalItemsStatus[i] === "Y") {
        list += POSSIBLE_ADDITIONAL_ITEMS[i] + " | ";
      }
    }
    return list.substring(0, list.length - 3); // housekeeping: remove the last " | "
  }
  getSellerReachOut() {
    return this.inboundProducts.sellerReach;
  }
  getVendorNameInitials() {
    const vendorName = this.inboundProducts.vendorsName.split(" ");
    
    if (vendorName.length > 1) {
      return (
        vendorName[0].slice(0, 1).toUpperCase() +
        vendorName[1].slice(0, 1).toUpperCase()
      );
    } else if (vendorName.length === 1) {
      return vendorName[0].slice(0, 1).toUpperCase();
    } else {
      return "";
    }
  }
  addCalculatedCellsInProductRows(
    productsWithConsignmentDetails: string[][],
    lastUsedRow: number
  ) {
    let newRow = lastUsedRow + 1;
    let productRows = [...productsWithConsignmentDetails];
    for (let row = 0; row < productsWithConsignmentDetails.length; row++) {
      productRows[
        row
      ][3] = `=IF(C${newRow}="","",DATEDIF(C${newRow},TODAY(), "d"))`;
      productRows[row][7] = `=J${newRow}&" "&K${newRow}`;
      productRows[row][18] = `=(Q${newRow}-R${newRow})/Q${newRow}`;
      productRows[row][20] = `=Q${newRow}/P${newRow}`;
      newRow++;
    }

    return productRows;
  }
  async getSkuRunningNumber(merchandiserName: string) {
    try {
      const merch = new Merchandiser(merchandiserName);
      const { id } = await merch.findInfo();

      const rn = new RunningNumberSKU();
      const currentRunningNumberDetailsOfMerch =
        await rn.queryRunningNumberOfMerchandiser(id);

      if (currentRunningNumberDetailsOfMerch) {
        return currentRunningNumberDetailsOfMerch.running_number;
      } else {
        rn.intializeRunningNumberForMerchandiser(id);
        return 1;
      }
    } catch (error) {
      console.log(error);
    }
  }
  async generateProductSku() {
    const vendorName = this.inboundProducts.vendorsName;
    const skuRunningNumber: number = await this.getSkuRunningNumber(vendorName);

    return (
      (this.identity() === "Acquisition" ? "S" : "C") +
      this.inboundProducts.handoverDate.year.slice(2, 4) +
      this.inboundProducts.handoverDate.month +
      convertNumberToThreeDigitString(skuRunningNumber) +
      this.getVendorNameInitials()
    );
  }
  async incrementRunningNumberOfSku(merchandiserName: string) {
    const merch = new Merchandiser(merchandiserName);
    const { id } = await merch.findInfo();
    const rn = new RunningNumberSKU();
    await rn.incrementRunningNumberOfSKU(id);
  };
  async getMerchandiserId(merchandiserName: string) {
    const merch = new Merchandiser(merchandiserName);
    const { id } = await merch.findInfo();
    return id;
  };
}

class AcquisitionForm extends Jotform {
  data: Jotform;

  constructor(data: Jotform) {
    super(data);
  }

  async getProductsWithAcquisitionDetails() {
    // structure of returned data is deliberately made to suit input format
    // for gsheet bulk update operation e.g. string[][]
    const productDetails = this.getProductDetails();
    let productsWithAcquisitionDetails: string[][] = [];

    for (const prod of productDetails) {
      const productSKU = await this.generateProductSku();
      const availableAdditionalItemsStatus =
        this.getProductAdditionalItemsStatus(prod);

      const productWithAcquisitionDetails = [
        "A",
        this.getSellerReachOut(),
        this.getHandoverDate(),
        "",
        "",
        this.getFormSubmissionReference(),
        productSKU,
        "",
        prod.Brand,
        prod.Model,
        prod.Material,
        prod.Color,
        "",
        "",
        "",
        "",
        "",
        prod["Acquisition Price (S$)"],
        "",
        "",
        "",
        this.getSellerId(),
        this.getSellerName(),
        this.getSellerContact(),
        this.getSellerEmail(),
        prod["Product s/n"],
        "",
        "",
      ]
        .concat(availableAdditionalItemsStatus)
        .concat([
          `-SKU: ${productSKU}
        -Material: ${prod.Material} 
        -Color: ${prod.Color} 
        -Hardware: 
        -Interior: 
        -Exterior: 
        -Attached:
        -Dimension:
        -Receipt: ${availableAdditionalItemsStatus[5] === "Y" ? "Yes" : "No"}
        -Accessories: ${this.getProductAdditionalItemsList(
          availableAdditionalItemsStatus
        )}
        -Date code / Blind Stamp / Series: 
        -Made in: `,
        ]);
      productsWithAcquisitionDetails.push(productWithAcquisitionDetails);

      // After generating a SKU number for each product, we should increment
      // the running number of the Merchandiser to keep each SKU unique.
      await this.incrementRunningNumberOfSku(this.inboundProducts.vendorsName);

      // Save a copy of the product details with the generated SKU in db for future reference
      const merchId = await this.getMerchandiserId(this.inboundProducts.vendorsName);
      const product = new Product(merchId, "A", productSKU, prod.Brand, prod.Model, prod.Color, prod["Product s/n"]);
      await product.save();
    }
    return productsWithAcquisitionDetails;
  }
}
class ConsignmentForm extends Jotform {
  data: Jotform;

  constructor(data: Jotform) {
    super(data);
  }

  async getProductsWithConsignmentDetails() {
    // structure of returned data is deliberately made to suit input format
    // for gsheet bulk update operation e.g. string[][]

    const productDetails = this.getProductDetails();
    let productsWithConsignmentDetails: string[][] = [];

    for (const prod of productDetails) {
      const productSKU = await this.generateProductSku();
      const availableAdditionalItemsStatus = this.getProductAdditionalItemsStatus(prod);

      const productWithConsignmentnDetails = [
        "C",
        this.getSellerReachOut(),
        this.getHandoverDate(),
        "",
        "",
        this.getFormSubmissionReference(),
        productSKU,
        "",
        prod.Brand,
        prod.Model,
        prod.Material,
        prod.Color,
        "",
        "",
        "",
        "",
        prod["Sales Reserve Price* (S$)"],
        "",
        "",
        "",
        "",
        this.getSellerId(),
        this.getSellerName(),
        this.getSellerContact(),
        this.getSellerEmail(),
        prod["Product s/n"],
        "",
        "",
      ]
        .concat(availableAdditionalItemsStatus)
        .concat([
          `-SKU: ${productSKU}
        -Material: ${prod.Material} 
        -Color: ${prod.Color} 
        -Hardware: 
        -Interior: 
        -Exterior: 
        -Attached:
        -Dimension:
        -Receipt: ${availableAdditionalItemsStatus[5] === "Y" ? "Yes" : "No"}
        -Accessories: ${this.getProductAdditionalItemsList(
          availableAdditionalItemsStatus
        )}
        -Date code / Blind Stamp / Series:
        -Made in: `,
        ]);
      productsWithConsignmentDetails.push(productWithConsignmentnDetails);

      // After generating a SKU number for each product, we should increment
      // the running number of the Merchandiser to keep each SKU unique.
      await this.incrementRunningNumberOfSku(this.inboundProducts.vendorsName);
      // Save a copy of the product details with the generated SKU in db for future reference
      const merchId = await this.getMerchandiserId(this.inboundProducts.vendorsName);
      const product = new Product(merchId, "C", productSKU, prod.Brand, prod.Model, prod.Color, prod["Product s/n"]);
      await product.save();
    }
    return productsWithConsignmentDetails;
  }
}

export { AcquisitionForm, ConsignmentForm, Jotform };
