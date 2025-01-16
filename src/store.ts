import { dispose, IDisposable } from './core';


/**
 * Manages a collection of disposable values.
 *
 * This is the preferred way to manage multiple disposables. A `DisposableStore` is safer to work with than an
 * `IDisposable[]` as it considers edge cases, such as registering the same value multiple times or adding an item to a
 * store that has already been disposed of.
 */
export class DisposableStore implements IDisposable {
  public static DISABLE_DISPOSED_WARNING = false;

  readonly #toDispose = new Set<IDisposable>();
  #isDisposed = false;

  /**
	 * Dispose of all registered disposables and mark this object as disposed.
	 *
	 * Any future disposables added to this object will be disposed of on `add`.
	 */
  public dispose(): void {
    if(this.#isDisposed) return;

    this.#isDisposed = true;
    this.clear();
  }

  /**
	 * @return `true` if this object has been disposed of.
	 */
  public get isDisposed(): boolean {
    return this.#isDisposed;
  }

  /**
	 * Dispose of all registered disposables but do not mark this object as disposed.
	 */
  public clear(): void {
    if(this.#toDispose.size === 0) return;

    try {
      dispose(this.#toDispose);
    } finally {
      this.#toDispose.clear();
    }
  }

  /**
	 * Add a new {@link IDisposable disposable} to the collection.
	 */
  public add<T extends IDisposable>(o: T): T {
    if(!o) return o;

    if((o as unknown as DisposableStore) === this) {
      throw new Error('Cannot register a disposable on itself!');
    }

    if(this.#isDisposed) {
      if(!DisposableStore.DISABLE_DISPOSED_WARNING) {
        console.warn(`Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!\n  At: ${new Error().stack || 'Unknown stacktrace'}`);
      }
    } else {
      this.#toDispose.add(o);
    }

    return o;
  }

  /**
	 * Deletes a disposable from store and disposes of it. This will not throw or warn and proceed to dispose the
	 * disposable even when the disposable is not part in the store.
	 */
  public delete<T extends IDisposable>(o: T): void {
    if(!o) return;
    
    if((o as unknown as DisposableStore) === this) {
      throw new Error('Cannot dispose a disposable on itself!');
    }

    this.#toDispose.delete(o);
    o.dispose();
  }

  /**
	 * Deletes the value from the store, but does not dispose it.
	 */
  public deleteAndLeak<T extends IDisposable>(o: T): void {
    if(!o) return;

    if(this.#toDispose.has(o)) {
      this.#toDispose.delete(o);
      // setParentOfDisposable(o, null);
    }
  }
}

export default DisposableStore;
