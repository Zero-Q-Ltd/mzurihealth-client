import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {QueueComponent} from './queue.component';

const routes: Routes = [
    {
        /**
         * Route everything to the main component
         */
        path: '**',
        component: QueueComponent,
    },
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class QueueRoutingModule {
}
