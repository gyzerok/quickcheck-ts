export type Generator<T> = {
  generate: () => T,
};

// ==== Internal helpers ==== //

const maxInt = 2147483647;
const minInt = -2147483648;

function random(from: number, to: number): Generator<number> {
  return {
    generate() {
      return Math.floor(Math.random() * to) + from;
    }
  };
}

const char = {
  generate() {
    return String.fromCharCode(random(32, 126).generate());
  },
} as Generator<string>;


// ==== Generators ==== //

export function frequency<T>(...specs: Array<[number, Generator<T>]>): Generator<T> {
  return {
    generate() {
      specs.forEach(([freq]) => {
        if (freq <= 0) {
          throw 'Frequency have to be positive number';
        }
      });

      const total = specs
        .map(spec => spec[0])
        .reduce((acc, x) => acc + x, 0);

      const pick = (choices: Array<[number, Generator<T>]>, n: number): T => {
        const [[freq, generator], ...rest] = choices;
        return n <= freq ? generator.generate() : pick(rest, n - freq);
      }

      return pick(specs, random(1, total).generate());
    }
  };
}

const undefinedGenerator = {
  generate() {
    return undefined;
  }
} as Generator<undefined>;

const nullGenerator = {
  generate() {
    return null;
  }
} as Generator<null>;

// hack to be able to use respected names
export {
  nullGenerator as null,
  undefinedGenerator as undefined,
}

export const number = {
  generate() {
    return random(-10000, 10000).generate();
  },
} as Generator<number>;

export const int = {
  generate() {
    return frequency(
      [3, random(-50, 50)],
      [0.2, constant(0)],
      [1, random(0, maxInt - minInt)],
      [1, random(minInt - maxInt, 0)]
    ).generate();
  }
} as Generator<number>;

export function intRange(from: number, to: number): Generator<number> {
  return {
    generate() {
      return frequency(
        [8, random(from, to)],
        [1, constant(from)],
        [1, constant(to)],
      ).generate();
    }
  };
}

export const string = {
  generate() {
    return array(char).generate().join('');
  },
} as Generator<string>;

export const boolean = {
  generate() {
    return random(0, 1).generate() === 1
      ? true
      : false;
  },
} as Generator<boolean>;

export function constant<T>(value: T): Generator<T> {
  return {
    generate() {
      return value;
    },
  };
}

export function literal<T extends number | string | boolean>(value: T): Generator<T> {
  return {
    generate() {
      return value;
    },
  };
}

export function maybe<T>(generator: Generator<T>): Generator<undefined | null | T> {
  return {
    generate() {
      return frequency(
        [2, undefinedGenerator],
        [2, nullGenerator],
        [1, generator],
      ).generate();
    },
  };
}

export function object<T>(schema: { [K in keyof T]: Generator<T[K]> }): Generator<T> {
  return {
    generate() {
      const ret = {} as T;
      for (const key in schema) {
        ret[key] = schema[key].generate();
      }
      return ret;
    },
  };
}

export function array<T>(generator: Generator<T>): Generator<T[]> {
  return {
    generate() {
      const length = frequency(
        [1, constant(0)],
        [1, constant(1)],
        [3, random(2, 10)],
        [2, random(100, 100)],
        [0.5, random(100, 400)]
      ).generate();

      const ret = [] as T[];
      for (let i = 0; i < length; i++) {
        ret.push(generator.generate());
      }
      return ret;
    },
  };
}

export function oneOf<T>(...generators: Generator<T>[]): Generator<T> {
  return {
    generate() {
      if (generators.length < 1) {
        throw new Error('You need to provide at least one generator for oneOf');
      }

      const withWeights = generators
        .map(generator => [1, generator] as [number, Generator<T>]);

      return frequency(...withWeights).generate();
    },
  };
}


// ==== Executors ==== //

export function check<T>(generator: Generator<T>, assertion: (val: T) => void): void {
  let i = 10;
  while (i--) {
    assertion(generator.generate());
  }
};
