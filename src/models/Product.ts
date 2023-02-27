import { db } from "../config/db";

export class Product {
  merchandiser_id: string;
  typology: string;
  sku: string;
  brand: string;
  model: string;
  color: string;
  product_serial: string;
  created_at: string;

  constructor(
    merchandiser_id: string,
    typology: string,
    sku: string,
    brand: string,
    model: string,
    color: string,
    product_serial: string
  ) {
    this.merchandiser_id = merchandiser_id;
    this.typology = typology;
    this.sku = sku;
    this.brand = brand;
    this.model = model;
    this.color = color;
    this.product_serial = product_serial;
  }

  async save() {
    try {
      let d = new Date();
      let YYYY = d.getFullYear();
      let MM = d.getMonth() + 1;
      let DD = d.getDate();
      let ss = d.getSeconds();
      let mm = d.getMinutes();
      let hh = d.getHours();
      let createdAtDate = `${YYYY}-${MM}-${DD} ${hh}-${mm}-${ss}`;

      let sql = `
            INSERT INTO 
                \`merchandising\`.\`product\` 
                    (\`merchandiser_id\`, \`typology\`, \`sku\`, \`brand\`, \`model\`, \`color\`, \`product_serial\`, \`created_at\`) 
                VALUES 
                    (
                    '${this.merchandiser_id}', 
                    '${this.typology.toUpperCase()}', 
                    '${this.sku.toUpperCase()}', 
                    '${this.brand.toLowerCase()}', 
                    '${this.model.toLowerCase()}', 
                    '${this.color.toLowerCase()}', 
                    '${this.product_serial.toUpperCase()}', 
                    '${createdAtDate}'
                    );
                `;

      return db.execute(sql);
    } catch (error) {
      console.log(error);
    }
  }
}
