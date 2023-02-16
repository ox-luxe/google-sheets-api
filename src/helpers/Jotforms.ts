import { getMonthName } from "./getMonthName";
import {
  ConsignedProducts,
  AcquiredProducts,
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
    this.inboundProducts = JSON.parse(this.data.rawRequest);
    
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
    return this.inboundProducts.q5_formId5;
  }

  // methods to extract common product attributes from both forms
    getId() {
    return this.inboundProducts.slug.split("/")[1];
  }
  getSellerName() {
    return this.inboundProducts.q3_sellersName;
  }

  getSellerContact() {
    return this.inboundProducts.q10_sellersContact;
  }
  getSellerId() {
    return this.inboundProducts.q9_sellersId;
  }
  getSellerAddress() {
    return this.inboundProducts.q13_sellersAddress;
  }
  getSellerEmail() {
    return this.inboundProducts.q14_sellersEmail;
  }
  getHandoverDate() {
    return (
      this.inboundProducts.q16_handoverDate.day +
      "-" +
      getMonthName(this.inboundProducts.q16_handoverDate.month) +
      "-" +
      this.inboundProducts.q16_handoverDate.year
    );
  }
  getProductDetails() {
    return JSON.parse(this.inboundProducts.q8_test);
  }
  getProductAdditionalItemsStatus(prod: ConsignmentProduct | AcquisitionProduct) {
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

  addCalculatedCellsInProductRows(productsWithConsignmentDetails: string[][], lastUsedRow: number) {
    let newRow = lastUsedRow + 1;
    let productRows = [...productsWithConsignmentDetails];
    for (let row = 0; row < productsWithConsignmentDetails.length; row++) {
      productRows[row][3] = `=IF(C${newRow}="","",DATEDIF(C${newRow},TODAY(), "d"))`;
      productRows[row][7] = `=J${newRow}&" "&K${newRow}`;
      productRows[row][18] = `=(Q${newRow}-R${newRow})/Q${newRow}`;
      productRows[row][20] = `=Q${newRow}/P${newRow}`;
      newRow++;
    }
    
    return productRows;
  }
}

class AcquisitionForm extends Jotform {
  data: Jotform;
  acquiredProducts: AcquiredProducts;

  constructor(data: Jotform) {
    super(data);
    this.acquiredProducts = JSON.parse(this.data.rawRequest);
  }

  getSellerReachOut() {
    return this.acquiredProducts.q74_sellerReach;
  }

  getProductSku() {
    // q16_handoverDate: { day: '01', month: '01', year: '2023' }
    return (
      "S" +
      this.acquiredProducts.q16_handoverDate.year.slice(2, 4) +
      this.acquiredProducts.q16_handoverDate.month +
      "XXX" +
      this.getVendorNameInitials()
    );
  }

  getVendorNameInitials() {
    const vendorName = this.acquiredProducts.q86_vendorsName.split(" ");

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

  getProductsWithAcquisitionDetails() {
    // structure of returned data is deliberately made to suit input format
    // for gsheet bulk update operation e.g. string[][]

    const productDetails = this.getProductDetails();
    return productDetails.map((prod: AcquisitionProduct) => {
      // empty strings below represent cells in google sheet that don't required automated inputs 
      return [
        "A",
        this.getSellerReachOut(),
        this.getHandoverDate(),
        "",
        "",
        this.getFormSubmissionReference(),
        this.getProductSku(),
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
      ].concat(this.getProductAdditionalItemsStatus(prod));
    });
  }


}

class ConsignmentForm extends Jotform {
  data: Jotform;
  consignedProducts: ConsignedProducts;
  constructor(data: Jotform) {
    super(data);
    this.consignedProducts = JSON.parse(this.data.rawRequest);
  }

  getSellerReachOut() {
    return this.consignedProducts.q73_sellerReach;
  }

  getProductSku() {
    // q16_handoverDate: { day: '01', month: '01', year: '2023' }
    return (
      "C" +
      this.consignedProducts.q16_handoverDate.year.slice(2, 4) +
      this.consignedProducts.q16_handoverDate.month +
      "XXX" +
      this.getVendorNameInitials()
    );
  }
  
  getVendorNameInitials() {
    const vendorName = this.consignedProducts.q22_vendorsName.split(" ");

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

  getProductsWithConsignmentDetails() {
    // structure of returned data is deliberately made to suit input format
    // for gsheet bulk update operation e.g. string[][]

    const productDetails = this.getProductDetails();
    return productDetails.map((prod: ConsignmentProduct) => {
      // empty strings below represent cells in google sheet that don't required automated inputs 
      return [
        "C",
        this.getSellerReachOut(),
        this.getHandoverDate(),
        "",
        "",
        this.getFormSubmissionReference(),
        this.getProductSku(),
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
      ].concat(this.getProductAdditionalItemsStatus(prod));
    });
  }


}

export { 
  AcquisitionForm, 
  ConsignmentForm, 
  Jotform };
