import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './errorpages/404/error-404.component';
import { UsersGuard } from './pages/guards/users.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminprofileComponent } from './pages/adminprofile/adminprofile.component';
import { MainLayoutComponent } from './pages/main-layout/main-layout.component';

const routes: Routes = [
    {
        path: '',
        canActivate: [UsersGuard],
        canLoad: [UsersGuard],
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: '',
                // canActivate: [UsersGuard],
                component: DashboardComponent
            },
            {
                path: 'profile',
                // canActivate: [UsersGuard],
                component: AdminprofileComponent
            },
            {
                path: 'appointments',
                // canActivate: [UsersGuard],
                // component: AppointmentComponent
                loadChildren: 'app/pages/calendar/calendar.module#CalendarModule'
            },
            {
                path: 'patients',
                // canActivate: [UsersGuard],
                loadChildren: 'app/pages/patients/patients.module#PatientsModule'
            },
            {
                path: 'documentation',
                loadChildren: 'app/pages/documentation/documentation.module#DocumentationModule'
            },
            {
                path: 'payments',
                loadChildren: 'app/pages/payments/payments.module#PaymentsModule'
            },
            {
                path: 'superadmin',
                // canActivate: [UsersGuard],
                loadChildren: 'app/pages/superadmin/superadmin.module#SuperAdminModule'
            },
            {
                path: 'knowledge-base',
                loadChildren: 'app/pages/knowledge-base/knowledge-base.module#KnowledgeBaseModule'
                // component: DashboardComponent
            },
        ]
    },
    {
        path: 'authentication',
        loadChildren: 'app/authentication/authentication.module#AuthenticationModule'
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
