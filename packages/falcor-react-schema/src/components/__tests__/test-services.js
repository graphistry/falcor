import { Observable } from 'rxjs/Observable';

import * as observable_from from 'rxjs/add/observable/from';
import * as observable_timer from 'rxjs/add/observable/timer';
import * as operator_let from 'rxjs/add/operator/let';
import * as operator_mapTo from 'rxjs/add/operator/mapTo';
import * as operator_toArray from 'rxjs/add/operator/toArray';
import * as operator_concatMap from 'rxjs/add/operator/concatMap';
import * as operator_mergeMapTo from 'rxjs/add/operator/mergeMapTo';

import { $ref } from '@graphistry/falcor-json-graph';

export function createTestServices(options = {}) {

    let g = {
        genres: [
            $ref(`listsById[123]`),
            $ref(`listsById[456]`),
            $ref(`listsById[789]`)
        ],
        listsById: {
            123: {
                id: 123,
                name: 'Action flicks',
                titles: [
                    $ref(`titlesById['abc']`)
                ]
            },
            456: {
                id: 456,
                name: 'Kid flicks',
                titles: [
                    $ref(`titlesById['def']`)
                ]
            },
            789: {
                id: 789,
                name: 'Starring Arnold Schwarzenegger',
                titles: [
                    $ref(`titlesById['abc']`),
                    $ref(`titlesById['def']`),
                    $ref(`titlesById['ghi']`)
                ]
            }
        },
        titlesById: {
            abc: {
                id: 'abc',
                rating: 25,
                name: 'True Lies'
            },
            def: {
                id: 'def',
                rating: 15,
                name: 'Kindergarten Cop'
            },
            ghi: {
                id: 'ghi',
                rating: 75,
                name: 'The Terminator'
            }
        }
    };

    const loadGenres = () => {
        return Observable
            .from([g])
            .let(letDelayEach(options.app));
    }
    const loadListsById = ({ listIds }) => {
        return Observable
            .from(listIds.map((id) => ({
                list: g.listsById[id]
            })))
            .let(letDelayEach(options.genres));
    }
    const loadTitlesById = ({ titleIds }) => {
        return Observable
            .from(titleIds.map((id) => ({
                title: g.titlesById[id]
            })))
            .let(letDelayEach(options.titles));
    }

    return {
        loadGenres,
        loadListsById,
        loadTitlesById
    };
}

function letDelayEach(options = {}, index) {
    return function(source) {
        if (options.batch === true) {
            return source.toArray();
        } else if (typeof options.delay === 'number') {
            return source.concatMap(function(x) {
                return Observable.timer(options.delay).mapTo(x);
            });
        } else if (Array.isArray(options.delay)) {
            if (typeof index === 'number') {
                return Observable.timer(options.delay[index]).mergeMapTo(source);
            } else {
                return source.mergeMap(function(x, i) {
                    return Observable.timer(options.delay[i]).mapTo(x);
                });
            }
        }
        return source;
    }
}
