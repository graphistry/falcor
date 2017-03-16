import { parse as pegJSParseUtil } from 'pegjs-util';
import toPaths from '@graphistry/falcor-query-syntax/lib/toPaths';
import toFlatBuffer from '@graphistry/falcor-path-utils/lib/toFlatBuffer';
import flatBufferToPaths from '@graphistry/falcor-path-utils/lib/flatBufferToPaths';
import computeFlatBufferHash from '@graphistry/falcor-path-utils/lib/computeFlatBufferHash';

export default function memoizeQueryies(limit = 100) {
    let count = 0, map = {}, lru = {};
    return function memoizedQuerySyntax(query) {
        let entry = map[query];
        if (entry === undefined && ++count > limit) {
            delete map[lru.tail.query];
            splice(lru, lru.tail);
        }
        if (!entry || !entry.error) {
            const result = pegJSParseUtil(toPaths.Parser, query);
            if (!result.error) {
                // Turn the computed AST into paths, then turn it back into an
                // AST so we collapse adjacent nodes.
                result.ast = computeFlatBufferHash(
                    toFlatBuffer(flatBufferToPaths(result.ast)));
            }
            entry = map[query] = { query, ...result };
            promote(lru, entry);
        }
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
