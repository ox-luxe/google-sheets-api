import { db } from "../config/db";

export class Merchandiser {
  name: string;
  initials: string;
  constructor(name: string) {
    this.name = name;
    this.initials = this.getNameInitials();
  }

  getNameInitials() {
    const vendorName = this.name.split(" ");

    if (vendorName.length > 1) {
      return (
        vendorName[0].slice(0, 1).toUpperCase() +
        vendorName[1].slice(0, 1).toUpperCase()
      );
    } else if (vendorName.length === 1 && vendorName[0] !== "") {
      return vendorName[0].slice(0, 1).toUpperCase();
    } else {
      return "XX";
    }
  }

  async save() {
    try {
      let sql = `INSERT INTO 
                \`merchandising\`.\`merchandiser\` 
                  (\`name\`, \`initials\`) 
                VALUES 
                  ('${this.name}', '${this.initials}');`;
      return db.execute(sql);
    } catch (error) {
      console.log(error);
    }
  }

  async findInfo() {
    try {
      let sql = `select * from merchandiser where name = '${this.name}';`;
      let result = await db.execute(sql);
      return result[0][0];
    } catch (error) {
      console.log(error);
    }
  }
}
