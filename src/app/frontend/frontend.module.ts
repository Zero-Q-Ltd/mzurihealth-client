import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FrontendRoutingModule} from './frontend-routing.module';
import {HomeComponent} from './home/home.component';
import {FuseSharedModule} from '../../@fuse/shared.module';

@NgModule({
    declarations: [HomeComponent],
    imports: [
        CommonModule,
        FrontendRoutingModule,
        FuseSharedModule,
    ]
})
export class FrontendModule {
}
