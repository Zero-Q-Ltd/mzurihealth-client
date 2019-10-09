import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsersGuard } from '../pages/guards/users.guard';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { LayoutModule } from '../pages/main-layout/layout/layout.module';
import { AdminlayoutComponent } from './adminlayout.component';
import { DocumentationModule } from '../pages/documentation/documentation.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { CalendarModule } from '../pages/calendar/calendar.module';
import { MainSharedModule } from '../pages/shared/main-shared.module';
import { AdminprofileComponent } from '../pages/adminprofile/adminprofile.component';
import { AdminService } from '../pages/services/admin.service';
import { NgxStronglyTypedFormsModule } from 'ngx-strongly-typed-forms';

@NgModule({
    imports: [
        CommonModule,

        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        NgxStronglyTypedFormsModule,
        AdminRoutingModule,
        LayoutModule,
        DocumentationModule,
        AuthenticationModule,
        CalendarModule,

        MainSharedModule,

    ],
    declarations: [
        DashboardComponent,
        AdminlayoutComponent,
        AdminprofileComponent,
    ],
    exports: [MainSharedModule],
    entryComponents: [],
    providers: [UsersGuard]
})
export class AdminModule {
    public constructor(private adminservice: AdminService) {
    }
}
