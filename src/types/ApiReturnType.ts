// NOTE: I don't think this does anything, but would be good to figure out how to properly enforce typings on the return.
export type ApiReturnType<T> = Promise<T | Record<string, any> | undefined>