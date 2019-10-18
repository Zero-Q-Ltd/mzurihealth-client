import { Component, Inject, OnInit, Optional } from '@angular/core';
import { fuseAnimations } from '../../../../../@fuse/animations';
import { Insurance, Patient } from '../../../../models/patient/Patient';
import * as moment from 'moment';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { PatientService } from '../../../services/patient.service';
import { NotificationService } from '../../../../shared/services/notifications.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { QueueService } from '../../../services/queue.service';
import { Paymentmethods } from '../../../../models/payment/PaymentChannel';
import { PaymentmethodService } from '../../../services/paymentmethod.service';

@Component({
    selector: 'general-details',
    templateUrl: './general-details.component.html',
    styleUrls: ['./general-details.component.scss'],
    animations: fuseAnimations

})
export class GeneralDetailsComponent implements OnInit {

    allInsurance: { [key: string]: Paymentmethods } = {};
    currentpatient: Patient;

    private insurance: FormArray;

    constructor(private adminservice: AdminService,
        private formBuilder: FormBuilder,
        private notificationservice: NotificationService,
        private paymentethods: PaymentmethodService,
        private queue: QueueService,
        @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) {

        this.paymentethods.allinsurance.subscribe(insurance => {
            this.allInsurance = insurance;
            if (!insurance['0']) {
                return;
            }
            this.allInsurance = insurance;
            /**
             * make sure insurances are already initialized to avoid crazy form errors
             */
            this.queue.currentpatient.subscribe(value => {
                this.currentpatient = value.patientdata;

            });
        });


    }

    ngOnInit(): void {
    }
}
