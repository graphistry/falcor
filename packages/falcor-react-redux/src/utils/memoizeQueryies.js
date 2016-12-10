import { parse as parseUtil } from 'pegjs-util';
import FalcorQuerySyntax from '@graphistry/falcor-query-syntax';

export default function memoizeQueryies(limit = 100) {
    let count = 0;
    const map = {}, lru = {};
    return function memoizedQuerySyntax(query) {
        let entry = map[query];
        if (entry === undefined && ++count > limit) {
            delete map[lru.tail.query];
            splice(lru, lru.tail);
        }
        if (!entry || entry.error) {
            entry = map[query] = {
                query, ...parseUtil(
                    FalcorQuerySyntax.parser, query
                )
            };
        }
        promote(lru, entry);
        return entry;
    }
}

function promote(lru, entry) {
    let head = lru.head;
    if (!head) {
        lru.head = lru.tail = entry;
        return;
    }
    else if (head === entry) {
        return;
    }
    let prev = entry.prev;
    let next = entry.next;
    next && (next.prev = prev);
    prev && (prev.next = next);
    entry.prev = undefined;
    // Insert into head position
    lru.head = entry;
    entry.next = head;
    head.prev = entry;
    // If the item we promoted was the tail, then set prev to tail.
    if (entry === lru.tail) {
        lru.tail = prev;
    }
}

function splice(lru, entry) {
    let prev = entry.prev;
    let next = entry.next;
    next && (next.prev = prev);
    prev && (prev.next = next);
    entry.prev = entry.next = undefined;
    if (entry === lru.head) {
        lru.head = next;
    }
    if (entry === lru.tail) {
        lru.tail = prev;
    }
}
