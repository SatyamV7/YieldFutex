function wait(signal) {
    return new Promise((res, rej) => {
        const waiter = { res, rej, next: null };
        let queue = signal.get();

        if (queue) {
            queue.tail.next = waiter;
            queue.tail = waiter;
        } else {
            queue = { head: waiter, tail: waiter };
            signal.set(queue);
        }
    });
}

function signal(signal, payload) {
    const queue = signal.get();
    if (!queue) {
        return 0;
    }

    const waiter = queue.head;

    try {
        queue.head = waiter.next;
    } finally {
        waiter.next = null;
    }

    if (!queue.head) {
        signal.set(undefined);
    }

    if (payload instanceof Error) {
        waiter.rej(payload);
    } else {
        waiter.res(payload);
    }
    return 1;
}

function interrupt(signal, payload, count = Infinity) {
    const queue = signal.get();
    if (!queue || count <= 0) {
        return 0;
    }

    let notified = 0;
    let waiter = queue.head;

    const isError = payload instanceof Error;

    while (waiter !== null && notified < count) {
        const next = waiter.next;

        try {
            queue.head = next;

            if (isError) {
                waiter.rej(payload);
            } else {
                waiter.res(payload);
            }
        } finally {
            waiter.next = null;
        }

        waiter = next;
        notified++;
    }

    if (queue.head === null) {
        signal.set(undefined);
    }

    return notified;
}

function broadcast(signal, payload) {
    const queue = signal.get();
    if (!queue) {
        return 0;
    }

    let notified = 0;
    let waiter = queue.head;

    const isError = payload instanceof Error;

    while (waiter !== null) {
        const next = waiter.next;

        try {
            if (isError) {
                waiter.rej(payload);
            } else {
                waiter.res(payload);
            }
        } finally {
            waiter.next = null;
        }

        waiter = next;
        notified++;
    }

    signal.set(undefined);

    return notified;
}

export { wait, signal, interrupt, broadcast };
