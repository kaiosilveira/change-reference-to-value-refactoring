import { Person } from './index';

describe('Person', () => {
  it('should set and get officeAreaCode', () => {
    const person = new Person();
    person.officeAreaCode = '123';
    expect(person.officeAreaCode).toBe('123');
  });

  it('should set and get officeNumber', () => {
    const person = new Person();
    person.officeNumber = '456';
    expect(person.officeNumber).toBe('456');
  });
});
