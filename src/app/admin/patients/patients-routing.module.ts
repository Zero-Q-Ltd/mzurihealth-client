import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AllComponent} from './all/all.component';
import {AddComponent} from './add/add.component';
import {ProfileComponent} from './profile/profile.component';

const routes: Routes = [
    {
        path: 'all',
        component: AllComponent,
    },
    {
        path: 'add',
        component: AddComponent,
    },
    {
        path: 'profile',
        component: ProfileComponent,
    },
    {
        path: 'queue',
        loadChildren: 'app/admin/patients/queue/queue.module#QueueModule'
    }
];


@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class PatientsRoutingModule {
}
