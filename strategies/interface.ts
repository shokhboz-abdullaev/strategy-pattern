import { BaseItem } from "../interfaces";

export enum SourceKind {
  Waxpeer,
  White,
}

export interface IEmitterStrategy<T> {
  map(data: T): BaseItem;
}
