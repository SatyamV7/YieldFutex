class RefCell {
    #ref;
    #frozen = false;

    constructor(referent) {
        this.#ref = referent;
    }

    get() {
        return this.#ref;
    }

    set(referent) {
        if (!this.#frozen) {
            this.#ref = referent;
        }
    }

    swap(referent) {
        const matched = !this.#frozen;
        try {
            return this.#ref;
        } finally {
            if (matched) {
                this.#ref = referent;
            }
        }
    }

    compareAndSwap(expected, replacement) {
        const matched = !this.#frozen && Object.is(this.#ref, expected);
        try {
            return this.#ref;
        } finally {
            if (matched) {
                this.#ref = replacement;
            }
        }
    }

    valueOf() {
        return this.#ref;
    }

    toString() {
        return String(this.#ref);
    }

    typeOf() {
        return typeof this.#ref;
    }

    instanceOf(constructor) {
        return this.#ref instanceof constructor;
    }

    freeze() {
        this.#frozen = true;
    }

    dispose() {
        this.#ref = undefined;
        this.#frozen = true;
    }

    [Symbol.toPrimitive]() {
        return this.#ref;
    }

    get [Symbol.toStringTag]() {
        return `RefCell<${typeof this.#ref}>`;
    }

    [Symbol.dispose]() {
        return void this.dispose();
    }
}

export { RefCell };
