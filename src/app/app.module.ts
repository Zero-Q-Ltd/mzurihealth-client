import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule, MatSnackBarModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import 'hammerjs';
import { FuseModule } from '@fuse/fuse.module';
import { FuseProgressBarModule } from '@fuse/components';

import { fuseConfig } from 'app/fuse-config';

import { AppComponent } from 'app/app.component';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { FuseSharedModule } from '../@fuse/shared.module';
import { Error404Module } from './errorpages/404/error-404.module';
import { Error500Module } from './errorpages/500/error-500.module';
import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { Angulartics2Module } from 'angulartics2';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxStronglyTypedFormsModule } from 'ngx-strongly-typed-forms';
import { AdminRoutingModule } from './admin/admin-routing.module';
import { LayoutModule } from '@angular/cdk/layout';
import { DocumentationModule } from './pages/documentation/documentation.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { CalendarModule } from 'angular-calendar';
import { AdminSharedModule } from './pages/shared/admin-shared.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminlayoutComponent } from './admin/adminlayout.component';
import { AdminprofileComponent } from './pages/adminprofile/adminprofile.component';
import { MainLayoutComponent } from './pages/main-layout/main-layout.component';

@NgModule({
    declarations: [
        AppComponent,
        NotificationComponent,
        DashboardComponent,
        AdminlayoutComponent,
        AdminprofileComponent,
        MainLayoutComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        CommonModule,
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyBLs7FSznETgYbDW0E3tR26lKFBzE43iaQ'
        }),
        FuseModule.forRoot(fuseConfig),
        FuseSharedModule,
        FuseProgressBarModule,
        MatIconModule,
        TranslateModule.forRoot(),
        AppRoutingModule,
        RouterModule,

        MatSnackBarModule,
        Error404Module,
        Error500Module,
        /* Angulartics2Module.forRoot(<Angulartics2Settings>{
             pageTracking: {clearHash: true, clearQueryParams: true},
             ga: {transport: 'beacon'},
             developerMode: !environment.gaTrackingId, // developerMode disables tracking
         }),*/

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

        AdminSharedModule,
        Angulartics2Module.forRoot(),
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),

    ],
    exports: [AdminSharedModule],
    entryComponents: [NotificationComponent],
    providers: [],
    bootstrap: [
        AppComponent,
    ]
})
export class AppModule {
    constructor() {
    }
}
