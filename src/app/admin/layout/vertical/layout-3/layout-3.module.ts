import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {FuseSidebarModule} from '@fuse/components/index';
import {FuseSharedModule} from '@fuse/shared.module';

import {ContentModule} from 'app/admin/layout/components/content/content.module';
import {FooterModule} from 'app/admin/layout/components/footer/footer.module';
import {NavbarModule} from 'app/admin/layout/components/navbar/navbar.module';
import {QuickPanelModule} from 'app/admin/layout/components/quick-panel/quick-panel.module';
import {ToolbarModule} from 'app/admin/layout/components/toolbar/toolbar.module';

import {VerticalLayout3Component} from 'app/admin/layout/vertical/layout-3/layout-3.component';

@NgModule({
    declarations: [
        VerticalLayout3Component
    ],
    imports: [
        RouterModule,

        FuseSharedModule,
        FuseSidebarModule,

        ContentModule,
        FooterModule,
        NavbarModule,
        QuickPanelModule,
        ToolbarModule
    ],
    exports: [
        VerticalLayout3Component
    ]
})
export class VerticalLayout3Module {
}
