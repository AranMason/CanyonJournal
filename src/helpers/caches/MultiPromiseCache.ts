export class MultiPromiseCache<K, V> {
    private map = new Map<K, Promise<V>>();

    constructor(private readonly fn: (key: K) => Promise<V>) { }

    get(key: K): Promise<V> {
        let promise = this.map.get(key);
        if (!promise) {
            promise = this.fn(key).catch(err => {
                this.map.delete(key); // retry next time
                throw err;
            });
            this.map.set(key, promise);
        }
        return promise;
    }

    reset(): void {
        this.map.clear();
    }
}
