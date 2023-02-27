import { InboundProducts } from "./../interfaces/Products.interface";

export function sanitiseFormFieldIds(
  formInputs: Record<
    string,
    string & { day: string; month: string; year: string } & {
      timeInput: string;
      hourSelect: string;
      minuteSelect: string;
      ampm: string;
    }
  >
): InboundProducts {
  let key: string;
  let keys = Object.keys(formInputs);
  var n = keys.length;
  let newobj: InboundProducts = {
    vendorsName: "",
    sellerReach: "",
    slug: "",
    sellersName: "",
    sellersId: "",
    sellersContact: "",
    sellersAddress: "",
    sellersEmail: "",
    handoverDate: {
      day: "",
      month: "",
      year: "",
    },
    handoverTime: {
      timeInput: "",
      hourSelect: "",
      minuteSelect: "",
      ampm: "",
    },
    test: "", // product details
    formId5: "",
  };
  while (n--) {
    key = keys[n];
    newobj[key.split("_")[1] as keyof InboundProducts] = formInputs[key];
  }
  return newobj;
}
