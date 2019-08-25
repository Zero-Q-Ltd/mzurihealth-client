import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule, HttpHeaders} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatIconModule, MatSnackBarModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import 'hammerjs';
import {FuseModule} from '@fuse/fuse.module';
import {FuseProgressBarModule} from '@fuse/components';

import {fuseConfig} from 'app/fuse-config';

import {AppComponent} from 'app/app.component';
import {RouterModule} from '@angular/router';
import {AppRoutingModule} from './app-routing.module';
import {FuseSharedModule} from '../@fuse/shared.module';
import {Error404Module} from './errorpages/404/error-404.module';
import {Error500Module} from './errorpages/500/error-500.module';
import {FrontendModule} from './frontend/frontend.module';
import {AgmCoreModule} from '@agm/core';
import {CommonModule} from '@angular/common';
import {NotificationComponent} from './shared/components/notification/notification.component';
import {Angulartics2Module} from 'angulartics2'

@NgModule({
    declarations: [
        AppComponent,
        NotificationComponent,
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
        FrontendModule,
        /* Angulartics2Module.forRoot(<Angulartics2Settings>{
             pageTracking: {clearHash: true, clearQueryParams: true},
             ga: {transport: 'beacon'},
             developerMode: !environment.gaTrackingId, // developerMode disables tracking
         }),*/
        Angulartics2Module.forRoot(),

    ],

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
