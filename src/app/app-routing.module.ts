import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './errorpages/404/error-404.component';
import { UsersGuard } from './pages/guards/users.guard';
import { AdminlayoutComponent } from './admin/adminlayout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminprofileComponent } from './pages/adminprofile/adminprofile.component';

const routes: Routes = [
    {
        path: '',
        canActivate: [UsersGuard],
        canLoad: [UsersGuard],
        component: AdminlayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'dashboard'
            },
            {
                path: 'dashboard',
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
                loadChildren: 'app/admin/calendar/calendar.module#CalendarModule'
            },
            {
                path: 'patients',
                // canActivate: [UsersGuard],
                loadChildren: 'app/admin/patients/patients.module#PatientsModule'
            },
            {
                path: 'documentation',
                loadChildren: 'app/admin/documentation/documentation.module#DocumentationModule'
            },
            {
                path: 'payments',
                loadChildren: 'app/admin/payments/payments.module#PaymentsModule'
            },
            {
                path: 'superadmin',
                // canActivate: [UsersGuard],
                loadChildren: 'app/admin/superadmin/superadmin.module#SuperAdminModule'
            },
            {
                path: 'knowledge-base',
                loadChildren: 'app/admin/knowledge-base/knowledge-base.module#KnowledgeBaseModule'
                // component: DashboardComponent
            },
        ]
    },
    {
        path: 'authentication',
        loadChildren: 'app/admin/authentication/authentication.module#AuthenticationModule'
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
