import { BaseItem } from "../interfaces";
import { IEmitterStrategy } from "./interface";

export interface WhiteItem {
  market_hash_name: string;
  price: string;
  market_product_link: string;
  market_product_count: number;
}

export class WhiteStrategy implements IEmitterStrategy<WhiteItem> {
  map(data: WhiteItem): BaseItem {
    return {
      count: data.market_product_count,
      name: data.market_hash_name,
    };
  }
}
