// common attributes in both consignment and acquisition form's submitted JSON data
interface InboundProducts {
  vendorsName: string;
  sellerReach: string;
  slug: string;
  sellersName: string;
  sellersId: string;
  sellersContact: string;
  sellersAddress: string;
  sellersEmail: string;
  handoverDate: {
    day: string;
    month: string;
    year: string;
  };
  handoverTime: {
    timeInput: string;
    hourSelect: string;
    minuteSelect: string;
    ampm: string;
  };
  test: string; // product details
  formId5: string;
}

// individual Product Attributes
interface ConsignmentProduct extends Product {
  ["Sales Reserve Price* (S$)"]: string;
}
interface AcquisitionProduct extends Product {}
interface Product {
  ["OX Id"]: string;
  Brand: string;
  Model: string;
  Material: string;
  Color: string;
  ["Product s/n"]: string;
  ["Acquisition Price (S$)"]: string;
  ["Additional items"]: string;
  ["Additional items / Remarks"]: string;
}

export {
  InboundProducts,
  ConsignmentProduct,
  AcquisitionProduct,
};
