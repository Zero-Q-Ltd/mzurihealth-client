import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {MatExpansionModule, MatIconModule} from '@angular/material';

import {FuseSharedModule} from '@fuse/shared.module';
import {FaqComponent} from './faq.component';
import {FaqService} from './faq.service';


const routes = [
    {
        path: 'faq',
        component: FaqComponent,
        resolve: {
            faq: FaqService
        }
    }
];

@NgModule({
    declarations: [
        FaqComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatExpansionModule,
        MatIconModule,

        FuseSharedModule
    ],
    providers: [
        FaqService
    ]
})
export class FaqModule {
}
