export class PostMessageEmitter {
    constructor(source, target) {
        this.source = source;
        this.target = target;
        this.listeners = {};
        this.connected = true;
        this.onPostMessage = this.onPostMessage.bind(this);
        source.addEventListener('message', this.onPostMessage);
    }
    onPostMessage(event = {}) {
        const { data = {} } = event;
        const { type, ...rest } = data;
        if (!type || type.indexOf('falcor-operation') === -1) {
            return;
        }
        const { listeners } = this;
        const handlers = listeners[type];
        if (!handlers) {
            return;
        }
        handlers.slice(0).forEach((handler) => handler && handler(rest));
    }
    on(eventName, handler) {
        const { listeners } = this;
        const handlers = listeners[eventName] || (listeners[eventName] = []);
        const handlerIndex = handlers.indexOf(handler);
        if (handlerIndex === -1) {
            handlers.push(handler);
        }
    }
    removeListener(eventName, handler) {
        const { listeners } = this;
        const handlers = listeners[eventName];
        if (!handlers) {
            return;
        }
        const handlerIndex = handlers.indexOf(handler);
        if (handlerIndex !== -1) {
            handlers.splice(handlerIndex, 1);
        }
        if (handlers.length === 0) {
            delete listeners[eventName];
        }
    }
    emit(eventName, { kind, value, error } = {}) {
        let finalized = false, payload;
        const { source, target } = this;
        switch (kind) {
            case 'N':
                payload = { kind, value };
                break;
            case 'E':
                payload = { kind, error };
                finalized = true;
                break;
            case 'C':
                payload = { kind };
                finalized = true;
                break;
        }
        if (finalized) {
            this.target = null;
            this.source = null;
            this.listeners = null;
            this.connected = false;
            if (source) {
                source.removeEventListener('message', this.onPostMessage);
            }
        }
        if (payload && target) {
            target.postMessage({ type: eventName, ...payload }, '*');
        }
    }
}
