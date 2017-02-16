import { expect } from 'chai';

import * as q from '../index';


function unreachable(_unused: never): never {
  throw 'this should never be executed';
}

function range(length: number): number[] {
  const ret = [] as number[];
  for (let i = 0; i < length; i++) {
    ret.push(i);
  }
  return ret;
}


describe('Suit', () => {
  describe('constant', () => {
    it('should generate value provided to it', () => {
      expect(q.constant(1).generate()).to.equal(1);
    })
  });

  describe('literal', () => {
    it('should generate value provided to it', () => {
      expect(q.literal(1).generate()).to.equal(1);
    })
  });

  describe('undefined', () => {
    it('should generate undefined', () => {
      expect(q.undefined.generate()).to.be.undefined;
    })
  });

  describe('null', () => {
    it('should generate null', () => {
      expect(q.null.generate()).to.be.null;
    })
  });

  describe('frequency', () => {
    it('should generate values according to weights', () => {
      const series = 10000;
      const eps = 0.01;

      const generator = q.frequency(
        [1, q.literal(1)],
        [2, q.literal(2)],
        [3, q.literal(3)],
        [4, q.literal(4)],
      );

      const values = range(series)
        .map(() => generator.generate())
        .reduce((acc, x) => {
          switch (x) {
            case 1:
              return { ...acc, ones: acc.ones + 1 };
            case 2:
              return { ...acc, twos: acc.twos + 1 };
            case 3:
              return { ...acc, threes: acc.threes + 1 };
            case 4:
              return { ...acc, forths: acc.forths + 1 };
            default:
              return unreachable(x);
          }
        }, { ones: 0, twos: 0, threes: 0, forths: 0 });

      expect(values.ones / series).to.be.closeTo(0.1, eps);
      expect(values.twos / series).to.be.closeTo(0.2, eps);
      expect(values.threes / series).to.be.closeTo(0.3, eps);
      expect(values.forths / series).to.be.closeTo(0.4, eps);
    });
  });

  describe('oneOf', () => {
    it('should each value with same frequency', () => {
      const series = 10000;
      const eps = 0.15;

      const generator = q.oneOf(
        q.literal(1),
        q.literal(2),
        q.literal(3),
        q.literal(4),
      );

      const values = range(series)
        .map(() => generator.generate())
        .reduce((acc, x) => {
          switch (x) {
            case 1:
              return { ...acc, ones: acc.ones + 1 };
            case 2:
              return { ...acc, twos: acc.twos + 1 };
            case 3:
              return { ...acc, threes: acc.threes + 1 };
            case 4:
              return { ...acc, forths: acc.forths + 1 };
            default:
              return unreachable(x);
          }
        }, { ones: 0, twos: 0, threes: 0, forths: 0 });

      expect(values.ones / series).to.be.closeTo(0.25, eps);
      expect(values.twos / series).to.be.closeTo(0.25, eps);
      expect(values.threes / series).to.be.closeTo(0.25, eps);
      expect(values.forths / series).to.be.closeTo(0.25, eps);
    });
  })
});