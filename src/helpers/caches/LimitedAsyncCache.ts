export class LimitedAsyncCache<K, V> {
    private map = new Map<K, V>();
    private inflight = new Map<K, Promise<V>>();

    constructor(private readonly limit: number = 100) { }

    /** Get a value and mark it as recently used */
    get(key: K): V | undefined {
        const value = this.map.get(key);
        if (value === undefined) return undefined;

        // Move to end (most recently used)
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    /** Insert or update a value and enforce LRU eviction */
    set(key: K, value: V): void {
        if (this.map.has(key)) {
            this.map.delete(key);
        } else if (this.map.size >= this.limit) {
            const oldestKey = this.map.keys().next().value;
            if (oldestKey !== undefined)
                this.map.delete(oldestKey);
        }

        this.map.set(key, value);
    }

    /** Get or insert asynchronously (dedupes concurrent fetches) */
    async getOrInsertAsync(key: K, fetcher: () => Promise<V>): Promise<V> {
        // 1. Cache hit → return immediately
        const cached = this.get(key);
        if (cached !== undefined) return cached;

        // 2. In-flight promise exists → await it
        if (this.inflight.has(key)) {
            return this.inflight.get(key)!;
        }

        // 3. Create in-flight promise
        const promise = fetcher()
            .then(value => {
                this.set(key, value);
                return value;
            })
            .finally(() => {
                this.inflight.delete(key);
            });

        // Store in-flight promise
        this.inflight.set(key, promise);

        return promise;
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

    size(): number {
        return this.map.size;
    }

    clear(): void {
        this.map.clear();
        this.inflight.clear();
    }
}
