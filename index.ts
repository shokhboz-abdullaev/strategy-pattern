// const events = require('events');
// const eventEmitter = new events.EventEmitter();

import EventEmitter from "events";
import { IEmitterStrategy, SourceKind } from "./strategies/interface";
import { BaseItem, IEventController } from "./interfaces";
import axios from "axios";
import { WATCH_FREQUENCY } from "./constants";
import { WaxpeerStrategy } from "./strategies/waaxpeer";
import { WhiteStrategy } from "./strategies/white";

export class EventController extends EventEmitter implements IEventController {
  previous: { [key in SourceKind]: BaseItem[] } = {[SourceKind.Waxpeer]: [{count: 100, name: 'hello'}]} as { [key in SourceKind]: BaseItem[] };

  constructor() {
    super();

    this.init();
  }

  async init() {
    const sources = {
      [SourceKind.Waxpeer]: {
        mapper: new WaxpeerStrategy(),
        url: "https://api.waxpeer.com/v1/prices",
      },
      [SourceKind.White]: {
        mapper: new WhiteStrategy(),
        url: "https://api.white.market/export/v1/prices/730.json",
      },
    } as const;

    const promises: Promise<void>[] = [];

    for (const key of Object.keys(sources)) {
      const source = sources[key];

      const kind: SourceKind = key as unknown as SourceKind;

      promises.push(this.instantiateWatcher(source.url, kind, source.mapper));
    }

    await Promise.allSettled(promises);
  }

  watcherCallback<T>(
    url: string,
    kind: SourceKind,
    mapper: IEmitterStrategy<T>
  ): () => Promise<void> {
    return async () => {
      console.log(`Initializing request to ${url}`)
      const { data } = await axios.get<T[]>(url);


      const current = data.map(mapper.map);


      this.notify({ previous: this.previous[kind], current }, kind);

      this.previous[kind] = current;
      
      console.log(`Finished request to ${url}`)
    };
  }

  async preWatch<T>(
    url: string,
    kind: SourceKind,
    mapper: IEmitterStrategy<T>
  ) {
    const callback = this.watcherCallback(url, kind, mapper);

    await callback();

    return callback;
  }

  async instantiateWatcher<T>(
    url: string,
    kind: SourceKind,
    mapper: IEmitterStrategy<T>
  ) {
    const callback = await this.preWatch(url, kind, mapper);

    setInterval(callback, WATCH_FREQUENCY)
  }

  notify(
    data: { previous: BaseItem[]; current: BaseItem[] },
    kind: SourceKind
  ) {

    if (!data.previous) {
        return
    }


    const currentMapped = data.current.reduce((acc, current, idx) => {
      acc[current.name] = current

      return acc;
    }, {} as Record<string, BaseItem>);

    const eventKey = `item:deleted:${kind}`;


    for (const previousItem of data.previous) {
      const currentItem = currentMapped[previousItem.name];

      if (!currentItem) {
        this.emit(
          eventKey,
          `Item ${previousItem.name} has been deleted altogether!`
        );

        continue
      }

      if (currentItem.count < previousItem.count) {
        this.emit(
          eventKey,
          `Item ${previousItem.name} has been decreased to ${
            currentItem.count
          } (for ${previousItem.count - currentItem.count})!`
        );
      }
    }
  }
}

const instance = new EventController() 


instance.on(`item:deleted:${SourceKind.Waxpeer}`, (payload) => {
    console.log(payload)
})

instance.on(`item:deleted:${SourceKind.White}`, (payload) => {
    console.log(payload)
})