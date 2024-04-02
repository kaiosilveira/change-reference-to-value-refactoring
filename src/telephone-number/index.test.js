import { TelephoneNumber } from './index';

describe('TelephoneNumber', () => {
  it('should set and get areaCode', () => {
    const telephoneNumber = new TelephoneNumber();
    telephoneNumber.areaCode = '123';
    expect(telephoneNumber.areaCode).toBe('123');
  });

  it('should set and get number', () => {
    const telephoneNumber = new TelephoneNumber();
    telephoneNumber.number = '456';
    expect(telephoneNumber.number).toBe('456');
  });
});
