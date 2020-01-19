import Index from './Index';
import { newLogger } from 'dbux-common/src/log/logger';
import DataEntry from 'dbux-common/src/core/data/DataEntry';

export default class Collection<T : DataEntry> {
  name : string;
  _all : T[] = [null];
  indexes : Index<T>[] = [];
  _byIndex : T[][] = [];

  constructor(name, dp) {
    this.log = newLogger(`${name} (Col)`);
    this.name = name;
    this.dp = dp;
  }

  // ###########################################################################
  // Writes
  // ###########################################################################

  addIndex(index : Index<T>) {
    this.indexes.push(index);
  }

  add(entries : T[]) {
    this._all.push(...entries);
  }

  /**
   * Will be called after all entries have been added, and before event listeners are notified.
   */
  processNewEntries(entries : T[]) {
    // process indexes
    for (const index of this.indexes) {
      const { name, makeKey } = index;
      const byKey = (this._byIndex[name] = this._byIndex[name] || {});
      for (const entry of entries) {
        const key = makeKey(this.dp, entry);
        if (key === undefined) {
          this.log.warn(`key generated by index ${name} is undefined`);
        }
        byKey[key] = entry;
      }
    }
  }

  // ###########################################################################
  // Reads
  // ###########################################################################

  getAll() : T[] {
    return this._all;
  }

  getById(id : number) {
    return this._all[id];
  }
}