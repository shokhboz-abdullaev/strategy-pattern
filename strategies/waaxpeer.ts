import { BaseItem } from "../interfaces";
import { IEmitterStrategy, SourceKind } from "./interface";

interface WaxpeerItem {
  name: string;
  count: number;
  min: number;
  steam_price: number;
  img: string;
  type: string;
  rarity_color: string;
}

export class WaxpeerStrategy implements IEmitterStrategy<WaxpeerItem> {
  map(data: WaxpeerItem): BaseItem {
    return {
      count: data.count,
      name: data.name,
    };
  }
}
