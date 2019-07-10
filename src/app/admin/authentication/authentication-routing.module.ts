import {NgModule} from '@angular/core';
import {Login2Component} from './login-2/login-2.component';
import {LockComponent} from './lock/lock.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: 'login',
        component: Login2Component
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'signin',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'locked',
        component: LockComponent
    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthenticationRoutingModule {
}
