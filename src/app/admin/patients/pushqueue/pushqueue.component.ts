import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { Validators } from '@angular/forms';
import { FormArray, FormControl, FormGroup, FormBuilder } from 'ngx-strongly-typed-forms';
import { Insurance, Patient } from '../../../models/patient/Patient';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { PaymentmethodService } from '../../services/paymentmethod.service';
import { PaymentChannel, Paymentmethods } from '../../../models/payment/PaymentChannel';
import { PatientService } from '../../services/patient.service';
import { NotificationService } from '../../../shared/services/notifications.service';
import { NewVisit, NewVisitInsurance } from 'app/models/visit/Visit';

@Component({
    selector: 'app-pushqueue',
    templateUrl: './pushqueue.component.html',
    styleUrls: ['./pushqueue.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class PushqueueComponent implements OnInit {

    queueForm: FormGroup<NewVisit>;
    allInsurance: { [key: string]: Paymentmethods } = {};
    patient: Patient;
    dialogTitle: string;
    paymentMethods: Array<PaymentChannel>;

    /**
     * Important for our views
     */
    insuranceSelected: boolean;
    selectedInsuranceId: number;
    constructor(private _formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private _data: any,
        public matDialogRef: MatDialogRef<PushqueueComponent>,
        private notificationService: NotificationService,
        private paymentmethodService: PaymentmethodService,
        private patientService: PatientService) {

        this.patient = _data.patient;
        this.dialogTitle = 'Queue Patient';
        this.paymentmethodService.allpaymentchannels.subscribe(payments => {
            this.paymentMethods = payments;
        });

        this.paymentmethodService.allinsurance.subscribe(insurance => {
            this.allInsurance = insurance;
        });

        this.createQueueForm();
        /**
         * listen for insurance selection.
         * */
        this.listenForInsurance();

        /*
        * listen for insurance ArrayForm
        * **/
    }

    ngOnInit(): void {
    }

    createQueueForm(): void {
        this.queueForm = this._formBuilder.group<NewVisit>({
            description: ['', Validators.required],
            payment: [null, Validators.required],
            insurance: this._formBuilder.array<NewVisitInsurance>([]),
            selectedInsurance: null
        });
    }
    /**
     * Retruns the form array for dynamic manipulation
     */
    getinsuranceArray(): FormArray<NewVisitInsurance> {
        return this.queueForm.get('insurance') as FormArray<NewVisitInsurance>;
    }

    removeInsurance(index: number): void {
        this.getinsuranceArray().removeAt(index);
    }

    addInsurance(): void {
        this.getinsuranceArray().push(this.createInsurance());
    }

    submitForm(): void {
        if (this.queueForm.get('payment').value.name === 'insurance') {
            if (this.queueForm.get('selectedInsurance').value === null) {
                this.notificationService.notify({
                    alertType: 'info',
                    body: 'Please select Insurance',
                    title: 'Select insurance',
                    placement: { horizontal: 'right', vertical: 'top' }
                });
                return;
            }
            this.matDialogRef.close(this.queueForm.getRawValue());
        } else {
            this.notificationService.notify({
                alertType: 'info',
                body: 'The user does not have any insurance',
                title: 'No Insurance',
                placement: { horizontal: 'right', vertical: 'top' }
            });
        }
    }



    setSelectedInsurance(index: number): void {
        if (index === this.queueForm.get('selectedInsurance').value) {
            this.queueForm.get('selectedInsurance').patchValue(null);
            console.log('item unselected');
            this.selectedInsuranceId = null;
            return;
        }
        this.selectedInsuranceId = index;
        this.queueForm.get('selectedInsurance').patchValue(index);
    }

    private listenForInsurance(): void {
        this.queueForm.get('payment').valueChanges.subscribe((value) => {
            if (value.name === 'insurance') {
                this.insuranceSelected = true;
                this.patient.insurance.map((insuranceData: Insurance, index) => {
                    this.addInsurance();

                    const mergedData = Object.assign({}, this.allInsurance[insuranceData._id],
                        { id: insuranceData._id, insuranceno: insuranceData.insuranceNo });

                    this.getinsuranceArray().controls[index].get('insuranceId').patchValue(mergedData.id, { emitEvent: false });
                    this.getinsuranceArray().controls[index].get('insuranceNumber').patchValue(mergedData.insuranceno, { emitEvent: false });

                    /*
                    * disable inputs
                    * **/
                    this.getinsuranceArray().controls[index].get('insuranceId').disable({ emitEvent: false });
                    this.getinsuranceArray().controls[index].get('insuranceNumber').disable({ emitEvent: false });
                });

            } else {
                // clear formArray values
                this.insuranceSelected = false;
                this.getinsuranceArray().controls = [];
                this.queueForm.get('selectedInsurance').patchValue(null);

            }
        });
    }

    private createInsurance(): FormGroup<NewVisitInsurance> {
        return this._formBuilder.group<NewVisitInsurance>({
            insuranceId: new FormControl('', Validators.required),
            insuranceNumber: new FormControl('', Validators.required)
        });
    }
}
