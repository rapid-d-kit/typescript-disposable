import { IDisposable } from './core';


/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
 */
export class MutableDisposable<T extends IDisposable> implements IDisposable {
  #value?: T;
  #isDisposed = false;

  public get value(): T | undefined {
    return this.#isDisposed ? undefined : this.#value;
  }

  public set value(value: T | undefined) {
    if(this.#isDisposed || value === this.#value) return;

    this.#value?.dispose();
    this.#value = value;
  }

  /**
	 * Resets the stored value and disposed of the previously stored value.
	 */
  public clear(): void {
    this.value = undefined;
  }

  public dispose(): void {
    this.#isDisposed = true;
    // markAsDisposed(this);
    this.#value?.dispose();
    this.#value = undefined;
  }

  /**
	 * Clears the value, but does not dispose it.
	 * The old value is returned.
	*/
  public clearAndLeak(): T | undefined {
    const oldValue = this.#value;
    this.#value = undefined;

    return oldValue;
  }
}

export default MutableDisposable;
