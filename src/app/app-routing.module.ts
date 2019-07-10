import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {Error404Component} from './errorpages/404/error-404.component';

const routes: Routes = [
    {
        path: '',
        loadChildren: 'app/frontend/frontend.module#FrontendModule',
    },
    {
        path: 'admin',
        loadChildren: 'app/admin/admin.module#AdminModule',
    },
    {
        path: 'patientsportal',
        loadChildren: 'app/patientsportal/patientsportal.module#PatientsportalModule'
    },
    {
        path: '**', component: Error404Component
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
