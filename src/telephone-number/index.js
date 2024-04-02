export class TelephoneNumber {
  constructor(areaCode, number) {
    this._areaCode = areaCode;
    this._number = number;
  }

  get areaCode() {
    return this._areaCode;
  }

  get number() {
    return this._number;
  }

  equals(other) {
    if (!other instanceof TelephoneNumber) return false;
    return this.areaCode === other.areaCode && this.number === other.number;
  }
}
