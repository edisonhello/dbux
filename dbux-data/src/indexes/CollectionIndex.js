import { newLogger } from 'dbux-common/src/log/logger';

export default class CollectionIndex<T> {
  dp: DataProvider;
  name;
  _byKey: T[][] = [];

  constructor(collectionName, indexName, addOnNewData = true) {
    this.collectionName = collectionName;
    this.name = indexName;
    this.log = newLogger(`${indexName} (Index)`);
    this.addOnNewData = addOnNewData;
  }

  _init(dp) {
    this.dp = dp;
  }

  get(key: number): T[] {
    return this._byKey[key];
  }

  addEntries(entries : T[]) {
    for (const entry of entries) {
      this.addEntry(entry);
    }
  }

  addEntry(entry : T) {
    const key = this.makeKey(this.dp, entry);
    if (key === undefined) {
      debugger;
      this.log.error('makeKey returned undefined');
      return;
    }
    if (key === false) {
      // entry is filtered out; not part of this index
      return;
    }

    // for optimization reasons, we are currently only accepting simple number indexes
    if (!Number.isInteger(key)) {
      this.log.error('invalid key for index (currently only numbers are supported):', key);
    }
    else {
      const ofKey = (this._byKey[key] = this._byKey[key] || []);
      ofKey.push(entry);

      // sanity check
      // if (ofKey.includes(undefined)) {
      //   this.log.error('Index contains undefined values', key, entry, ofKey);
      // }
    }
  }

  addEntryById(id) {
    const entry = this.dp.collections[this.collectionName].getById(id);
    this.addEntry(entry);
  }

  /**
   * Returns a unique key (number) for given entry.
   */
  makeKey(dp, entry : T) : number | bool {
    throw new Error(`abstract method not implemented: ${this.constructor.name}.makeKey`);
  }
}