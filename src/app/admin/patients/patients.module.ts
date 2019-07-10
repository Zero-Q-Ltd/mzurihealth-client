import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AllComponent} from './all/all.component';
import {AddComponent} from './add/add.component';
import {PatientsRoutingModule} from './patients-routing.module';
import {AdminSharedModule} from '../shared/admin-shared.module';
import {InvoiceComponent} from './invoice/invoice.component';
import {ProfileComponent} from './profile/profile.component';
import {PushqueueComponent} from './pushqueue/pushqueue.component';
import {InvoiceCustomizationComponent} from './invoice-customization/invoice-customization.component';
import {PrescriptionComponent} from './prescription/prescription.component';

@NgModule({
    declarations: [AllComponent, AddComponent, InvoiceComponent, ProfileComponent, PushqueueComponent, InvoiceCustomizationComponent, PrescriptionComponent],
    imports: [
        CommonModule,
        PatientsRoutingModule,
        AdminSharedModule,
    ],
    entryComponents: [AddComponent, PushqueueComponent, InvoiceComponent, InvoiceCustomizationComponent, PrescriptionComponent, ProfileComponent],

})
export class PatientsModule {
}
