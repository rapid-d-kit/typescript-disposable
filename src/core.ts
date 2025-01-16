import Iterator from '@rapid-d-kit/iterator';


export interface IDisposable {
  dispose(): void;
}

export interface IAsyncDisposable {
  dispose(): Promise<void>;
}

export function toDisposable(dispose: () => void): IDisposable {
  return { dispose };
}

export function toAsyncDisposable(dispose: () => Promise<void>): IAsyncDisposable {
  return { dispose };
}


export class Disposable implements IDisposable {
  public static readonly None: IDisposable = Object.freeze<IDisposable>({ dispose() {} });
  readonly #lifecycle: Set<IDisposable> = new Set();
  #isDisposed: boolean = false;

  public dispose(): void {
    if(this.#isDisposed) return;

    this.#isDisposed = true;
    this.clear();
  }
    
  protected clear() {
    this.#lifecycle.forEach(item => item.dispose());
    this.#lifecycle.clear();
  }

  protected _register<T extends IDisposable>(t: T): T {
    if(this.#isDisposed) {
      console.warn('[Disposable] Registering disposable on object that has already been disposed.');
      t.dispose();
    } else {
      this.#lifecycle.add(t);
    }

    return t;
  }
}

export class AsyncDisposable implements IAsyncDisposable {
  public static readonly None: IAsyncDisposable = Object.freeze<IAsyncDisposable>({ dispose: () => Promise.resolve(void 0) });
  readonly #lifecycle: Set<IAsyncDisposable> = new Set();
  #isDisposed: boolean = false;
    
  public dispose(): Promise<void> {
    if(this.#isDisposed) return Promise.resolve(void 0);

    this.#isDisposed = true;
    return this.clear();
  }
    
  protected async clear() {
    await Promise.all([...this.#lifecycle.values()].map(item => item.dispose()));
    this.#lifecycle.clear();
  }
    
  protected _register<T extends IAsyncDisposable>(t: T): T {
    if(this.#isDisposed) {
      console.warn('[AsyncDisposable] Registering disposable on object that has already been disposed.');
      t.dispose();
    } else {
      this.#lifecycle.add(t);
    }
    
    return t;
  }
    
}


export function isDisposable(arg: unknown): arg is IDisposable {
  return !!arg && typeof arg === 'object' && typeof (<IDisposable>arg).dispose === 'function';
}


export function dispose<T extends IDisposable>(disposable: T): T;
export function dispose<T extends IDisposable>(disposable: T | undefined): T | undefined;
export function dispose<T extends IDisposable, A extends Iterable<T> = Iterable<T>>(disposables: A): A;
export function dispose<T extends IDisposable>(disposables: Array<T>): Array<T>;
export function dispose<T extends IDisposable>(disposables: ReadonlyArray<T>): ReadonlyArray<T>;
export function dispose<T extends IDisposable>(arg: T | Iterable<T> | undefined): any {
  if(Iterator.isIterable<IDisposable>(arg)) {
    const errors: any[] = [];

    for(const d of arg) {
      if(d) {
        try {
          d.dispose();
        } catch (e) {
          errors.push(e);
        }
      }
    }

    if(errors.length === 1) {
      throw errors[0];
    } else if (errors.length > 1) {
      throw new AggregateError(errors, 'Encountered errors while disposing of store');
    }

    return Array.isArray(arg) ? [] : arg;
  } else if (arg) {
    (arg as T).dispose();
    return arg;
  }
}

export function disposeIfDisposable<T extends IDisposable | object>(disposables: Array<T>): Array<T> {
  for(const d of disposables) {
    if(isDisposable(d)) {
      d.dispose();
    }
  }
  
  return [];
}
