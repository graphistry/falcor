import { Model } from '@graphistry/falcor';
import Router from '@graphistry/falcor-router';

import * as Scheduler from 'rxjs/scheduler/async';
import * as operator_do from 'rxjs/add/operator/do';
import * as operator_toPromise from 'rxjs/add/operator/toPromise';

import { createTestServices } from './test-services';
import { createTestContainers } from './test-containers';

export function testInit(serviceOptions = {
    app: { batch: false, delay: undefined },
    genres: { batch: false, delay: undefined },
    titles: { batch: false, delay: undefined },
}) {
    const { App } = createTestContainers();
    return { App, model: new Model({
            recycleJSON: true,
            scheduler: Scheduler.async,
            source: new Router(App.schema(
                createTestServices(serviceOptions)
            ).toArray())
        })
    }
}
