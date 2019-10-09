import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsRoutingModule } from './payments-routing.module';
import { AllComponent } from './all/all.component';
import { MainSharedModule } from '../shared/main-shared.module';
import { InvoiceComponent } from './invoice/invoice.component';

@NgModule({
    declarations: [AllComponent, InvoiceComponent],
    imports: [
        MainSharedModule,
        CommonModule,
        PaymentsRoutingModule
    ],
    entryComponents: [InvoiceComponent]
})
export class PaymentsModule {
}
