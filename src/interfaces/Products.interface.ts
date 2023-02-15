interface AcquiredProducts extends InboundProducts {
  q74_sellerReach: string;
  q86_vendorsName: string; // vendor name
}
interface ConsignedProducts extends InboundProducts {
  q73_sellerReach: string;
  q22_vendorsName: string;
}
// common attributes in both consignment and acquisition form's submitted JSON data
interface InboundProducts {
  slug: string;
  q3_sellersName: string;
  q9_sellersId: string;
  q10_sellersContact: string;
  q13_sellersAddress: string;
  q14_sellersEmail: string;
  q16_handoverDate: {
    day: string;
    month: string;
    year: string;
  };
  q15_handoverTime: {
    timeInput: string;
    hourSelect: string;
    minuteSelect: string;
    ampm: string;
  };
  q8_test: string; // product details
  q5_formId5: string;
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
  ConsignedProducts,
  AcquiredProducts,
  InboundProducts,
  ConsignmentProduct,
  AcquisitionProduct,
};
