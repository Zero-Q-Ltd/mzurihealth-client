import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PaymentsRoutingModule} from './payments-routing.module';
import {AllComponent} from './all/all.component';
import {AdminSharedModule} from '../shared/admin-shared.module';
import {InvoiceComponent} from './invoice/invoice.component';

@NgModule({
    declarations: [AllComponent, InvoiceComponent],
    imports: [
        AdminSharedModule,
        CommonModule,
        PaymentsRoutingModule
    ],
    entryComponents: [InvoiceComponent]
})
export class PaymentsModule {
}
