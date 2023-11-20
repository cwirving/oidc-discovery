/**
 * Quick and dirty utility function to take an object with a `close()` method and generate a `Disposable` for it.
 * @param closable The object to make disposable.
 * @returns Returns a a `Disposable` interface implementation for the closable object.
 */
export function deferClose(closable: { close: () => void }): Disposable {
  return {
    [Symbol.dispose]() {
      closable.close();
    },
  };
}
