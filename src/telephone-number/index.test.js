import { TelephoneNumber } from './index';

describe('TelephoneNumber', () => {
  it('should create a new instance', () => {
    const telephoneNumber = new TelephoneNumber('123', '456');
    expect(telephoneNumber).toBeInstanceOf(TelephoneNumber);
    expect(telephoneNumber.areaCode).toBe('123');
    expect(telephoneNumber.number).toBe('456');
  });

  it('should set and get areaCode', () => {
    const telephoneNumber = new TelephoneNumber();
    telephoneNumber.areaCode = '123';
    expect(telephoneNumber.areaCode).toBe('123');
  });

  describe('equals', () => {
    it('should return true if two telephone numbers are equal', () => {
      const telephoneNumber1 = new TelephoneNumber('123', '456');
      const telephoneNumber2 = new TelephoneNumber('123', '456');
      expect(telephoneNumber1.equals(telephoneNumber2)).toBe(true);
    });

    it('should return false if two telephone numbers are not equal', () => {
      const telephoneNumber1 = new TelephoneNumber('123', '456');
      const telephoneNumber2 = new TelephoneNumber('123', '789');
      expect(telephoneNumber1.equals(telephoneNumber2)).toBe(false);
    });
  });
});
