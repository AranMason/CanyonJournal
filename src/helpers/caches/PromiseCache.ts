export class PromiseCache<V> {
    private promise: Promise<V> | null = null;

    constructor(private readonly fn: () => Promise<V>) { }

    get(): Promise<V> {
        if (!this.promise) {
            try {
                this.promise = this.fn();
            } catch (err) {
                // Don't store a failed synchronous call
                throw err;
            }
        }
        return this.promise;
    }

    reset(): void {
        this.promise = null;
    }
}
