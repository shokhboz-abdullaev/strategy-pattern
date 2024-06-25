import { EventEmitter } from "stream";
import { SourceKind } from "./strategies/interface";

export interface BaseItem {
  name: string;
  count: number;
}

export interface IEventController extends EventEmitter {
  notify(
    data: { previous: BaseItem[]; current: BaseItem[] },
    kind: SourceKind
  ): void;
}
