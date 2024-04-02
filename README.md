[![Continuous Integration](https://github.com/kaiosilveira/change-reference-to-value-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/change-reference-to-value-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Change Reference To Value

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
class Proudct {
  applyDiscount(arg) {
    this._price.amount -= arg;
  }
}
```

</td>

<td>

```javascript
class Proudct {
  applyDiscount(arg) {
    this._price = new Money(this._price.amount - arg, this._price.currency);
  }
}
```

</td>
</tr>
</tbody>
</table>

**Inverse of: [Change Value to Reference](https://github.com/kaiosilveira/change-value-to-reference-refactoring)**

Mutability is one of the most important aspects to be aware of in any software program. Ripple effects can cause hard-to-debug problems and flaky tests but, sometimes, they're exactly what we're expecting to happen. This refactoring helps in cases where we want our underlying objects (or data structures) to be immutable, therefore avoiding rippling side effects and leveraging the **[Value Object](https://github.com/kaiosilveira/poeaa-value-object)** pattern.

## Working example

Our working example, extracted from the book, is a program that contains a `Person` and a `TelehoneNumber` class. Each `Person` holds a reference to `TelephoneNumber` and also has getters and setters that update the underlying object. In this case, we want to **[remove the setting methods](https://github.com/kaiosilveira/remove-setting-method-refactoring)** from `TelephoneNumber` and recreate an instance of it every time a setter is called on `Person`.

The class representing a person looks like this:

```javascript
import { TelephoneNumber } from '../telephone-number';

export class Person {
  constructor() {
    this._telephoneNumber = new TelephoneNumber();
  }

  get officeAreaCode() {
    return this._telephoneNumber.areaCode;
  }

  set officeAreaCode(arg) {
    this._telephoneNumber.areaCode = arg;
  }

  get officeNumber() {
    return this._telephoneNumber.number;
  }

  set officeNumber(arg) {
    this._telephoneNumber.number = arg;
  }
}
```

And the class for telephone number like this:

```javascript
export class TelephoneNumber {
  get areaCode() {
    return this._areaCode;
  }

  set areaCode(arg) {
    this._areaCode = arg;
  }

  get number() {
    return this._number;
  }

  set number(arg) {
    this._number = arg;
  }
}
```

### Test suite

Our test suites are straightforward: For both classes, we're making sure we can use the setters and then retrieve data using the getters. They look like this:

```javascript
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
```

These are the minimum tests we need to safely proceed with the refactoring.

### Steps

Our main goal is to get rid of the setters on `TelephoneNumber`, but we still need to set it up somehow, so we introduce a constructor method (and in an extra cautious move, we add unit tests for it as well):

```diff
+++ b/src/telephone-number/index.js
@@ -1,4 +1,9 @@
 export class TelephoneNumber {
+  constructor(areaCode, number) {
+    this._areaCode = areaCode;
+    this._number = number;
+  }
+
   get areaCode() {
     return this._areaCode;
   }

diff --git a/src/telephone-number/index.test.js b/src/telephone-number/index.test.js
@@ -1,6 +1,13 @@
 import { TelephoneNumber } from './index';
 describe('TelephoneNumber', () => {
+  it('should create a new instance', () => {
+    const telephoneNumber = new TelephoneNumber('123', '456');
+    expect(telephoneNumber).toBeInstanceOf(TelephoneNumber);
+    expect(telephoneNumber.areaCode).toBe('123');
+    expect(telephoneNumber.number).toBe('456');
+  });
+
   it('should set and get areaCode', () => {
     const telephoneNumber = new TelephoneNumber();
     telephoneNumber.areaCode = '123';
```

Then we can start replacing the setting methods on `Person` with reassignments. We start with the `officeAreaCode`:

```diff
+++ b/src/person/index.js
@@ -10,7 +10,7 @@ export class Person {
   }
   set officeAreaCode(arg) {
-    this._telephoneNumber.areaCode = arg;
+    this._telephoneNumber = new TelephoneNumber(arg, this.officeNumber);
   }
   get officeNumber() {
```

Followed by the `officeNumber`:

```diff
+++ b/src/person/index.js
@@ -18,6 +18,6 @@ export class Person {
   }
   set officeNumber(arg) {
-    this._telephoneNumber.number = arg;
+    this._telephoneNumber = new TelephoneNumber(this.officeAreaCode, arg);
   }
 }
```

Finally, to make `TelephoneNumber` a true Value Object, we introduce an `equals` method (which is somewhat tricky to do in Javascript, but you get the idea anyway) and its companion unit tests:

```diff
+++ b/src/telephone-number/index.js
@@ -19,4 +19,9 @@ export class TelephoneNumber {
   set number(arg) {
     this._number = arg;
   }
+
+  equals(other) {
+    if (!other instanceof TelephoneNumber) return false;
+    return this.areaCode === other.areaCode && this.number === other.number;
+  }
 }

diff --git a/src/telephone-number/index.test.js b/src/telephone-number/index.test.js
@@ -19,4 +19,18 @@ describe('TelephoneNumber', () => {
     telephoneNumber.number = '456';
     expect(telephoneNumber.number).toBe('456');
   });
+
+  describe('equals', () => {
+    it('should return true if two telephone numbers are equal', () => {
+      const telephoneNumber1 = new TelephoneNumber('123', '456');
+      const telephoneNumber2 = new TelephoneNumber('123', '456');
+      expect(telephoneNumber1.equals(telephoneNumber2)).toBe(true);
+    });
+
+    it('should return false if two telephone numbers are not equal', () => {
+      const telephoneNumber1 = new TelephoneNumber('123', '456');
+      const telephoneNumber2 = new TelephoneNumber('123', '789');
+      expect(telephoneNumber1.equals(telephoneNumber2)).toBe(false);
+    });
+  });
 });
```

Finally, we can start removing the setting methods. We start with `number`:

```diff
+++ b/src/telephone-number/index.js
@@ -16,10 +16,6 @@ export class TelephoneNumber {
     return this._number;
   }
-  set number(arg) {
-    this._number = arg;
-  }
-
   equals(other) {
     if (!other instanceof TelephoneNumber) return false;
     return this.areaCode === other.areaCode && this.number === other.number;
diff --git a/src/telephone-number/index.test.js b/src/telephone-number/index.test.js
@@ -14,12 +14,6 @@ describe('TelephoneNumber', () => {
     expect(telephoneNumber.areaCode).toBe('123');
   });
-  it('should set and get number', () => {
-    const telephoneNumber = new TelephoneNumber();
-    telephoneNumber.number = '456';
-    expect(telephoneNumber.number).toBe('456');
-  });
-
   describe('equals', () => {
     it('should return true if two telephone numbers are equal', () => {
       const telephoneNumber1 = new TelephoneNumber('123', '456');
```

And then move on to `areaCode`:

```diff
+++ b/src/telephone-number/index.js
@@ -8,10 +8,6 @@ export class TelephoneNumber {
     return this._areaCode;
   }
-  set areaCode(arg) {
-    this._areaCode = arg;
-  }
-
   get number() {
     return this._number;
   }

diff --git a/src/telephone-number/index.test.js b/src/telephone-number/index.test.js
@@ -8,12 +8,6 @@ describe('TelephoneNumber', () => {
     expect(telephoneNumber.number).toBe('456');
   });
-  it('should set and get areaCode', () => {
-    const telephoneNumber = new TelephoneNumber();
-    telephoneNumber.areaCode = '123';
-    expect(telephoneNumber.areaCode).toBe('123');
-  });
-
   describe('equals', () => {
     it('should return true if two telephone numbers are equal', () => {
       const telephoneNumber1 = new TelephoneNumber('123', '456');
```

And we're done!

### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                                       | Message                                                               |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [cd833ad](https://github.com/kaiosilveira/change-reference-to-value-refactoring/commit/cd833ad652a9a37fcceba22c892ac0f3cdbfafa9) | introduce constructor method for `TelephoneNumber`                    |
| [1a5065e](https://github.com/kaiosilveira/change-reference-to-value-refactoring/commit/1a5065eb177c126c9cefb990544b5ccbfd8023f4) | replace setting method to reassignment at `set Person.officeAreaCode` |
| [e077b06](https://github.com/kaiosilveira/change-reference-to-value-refactoring/commit/e077b06e5c18d058c8859137adc3ac079a7c0084) | replace setting method to reassignment at `set Person.officeNumber`   |
| [ba7c14c](https://github.com/kaiosilveira/change-reference-to-value-refactoring/commit/ba7c14c2ff47151f38525a87eff99c279f446679) | introduce `equals` method for `TelephoneNumber`                       |
| [bf05671](https://github.com/kaiosilveira/change-reference-to-value-refactoring/commit/bf056716ab2ac221dbab714e80c66f73e63bd76e) | remove `number` setter of `TelephoneNumber`                           |
| [21e5206](https://github.com/kaiosilveira/change-reference-to-value-refactoring/commit/21e5206f3e5b250389e2306c6dda7561d12e876a) | remove `areaCode` setter for `TelephoneNumber`                        |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/change-reference-to-value-refactoring/commits/main).
