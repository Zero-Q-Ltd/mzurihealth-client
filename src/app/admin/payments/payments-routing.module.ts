import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {AllComponent} from './all/all.component';

const routes: Routes = [
    {
        path: 'all',
        component: AllComponent,
    },
    // {
    //     path: 'add',
    //     component: AddComponent,
    // },

];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class PaymentsRoutingModule {
}
