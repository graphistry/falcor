export class PostMessageEmitter {
    constructor(source, target, once) {
        this.once = once;
        this.source = source;
        this.target = target;
        this.listeners = {};
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
        handlers
            .slice(0)
            .forEach((handler) => handler && handler(rest));
    }
    on(eventName, handler) {
        const { listeners } = this;
        const handlers = listeners[eventName] || (listeners[eventName] = []);
        const handlerIndex = handlers.indexOf(handler);
        if (handlerIndex === -1) {
            handlers.push(handler);
        }
    }
    off(eventName, handler) {
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
    emit(eventName, data) {
        const { source, target, once } = this;
        if (once) {
            this.once = null;
            this.target = null;
            this.source = null;
            this.listeners = null;
            source && source.removeEventListener('message', this.onPostMessage);
        }
        target && target.postMessage({ type: eventName, ...data }, '*');
    }
}
