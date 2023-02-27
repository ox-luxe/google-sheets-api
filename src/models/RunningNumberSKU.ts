import { db } from "../config/db";
import { getCurrentMonth } from "../helpers/getCurrentMonth";
import { getCurrentYear } from "../helpers/getCurrentYear";

export class RunningNumberSKU {
  constructor() {}

  async incrementRunningNumberOfSKU(merchandiserId: number) {
    try {
      const runningNumberInfo = await this.queryRunningNumberOfMerchandiser(
        merchandiserId
      );

      if (runningNumberInfo !== undefined) {
        const { running_number_id, running_number } = runningNumberInfo;

        let sql = `UPDATE sku_running_number SET running_number=${running_number}+1 WHERE running_number_id=${running_number_id};`;
        let result = await db.execute(sql);

        return result;
      } else {
        await this.intializeRunningNumberForMerchandiser(merchandiserId);
      }
    } catch (error) {
      console.log(error);
    }
  }
  async queryRunningNumberOfMerchandiser(merchandiserId: number) {
    try {
      let sql = `
        SELECT * 
        FROM sku_running_number 
        WHERE 
        merchandiser_id = ${merchandiserId} AND 
        year = ${getCurrentYear()} AND 
        month = ${getCurrentMonth()};
        `;

      let result = await db.execute(sql);

      return result.length ? result[0][0] : undefined;
    } catch (error) {
      console.log(error);
    }
  }
  async intializeRunningNumberForMerchandiser(merchandiserId: number) {
    try {
      let sql = `
        INSERT INTO 
        \`merchandising\`.\`sku_running_number\` 
            (\`merchandiser_id\`, \`year\`, \`month\`, \`running_number\`) 
        VALUES 
            ('${merchandiserId}', ${getCurrentYear()}, '${getCurrentMonth()}', '1');`;
      let result = await db.execute(sql);

      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
