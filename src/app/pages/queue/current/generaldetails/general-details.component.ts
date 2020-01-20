import {Component, Inject, OnDestroy, OnInit, Optional} from '@angular/core';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {Patient} from '../../../../models/patient/Patient';
import {FormArray, FormBuilder} from '@angular/forms';
import {AdminService} from '../../../services/admin.service';
import {NotificationService} from '../../../../shared/services/notifications.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import {QueueService} from '../../../services/core/queue.service';
import {Paymentmethods} from '../../../../models/payment/PaymentChannel';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CoreService} from 'app/pages/services/core/core.service';

@Component({
    selector: 'general-details',
    templateUrl: './general-details.component.html',
    styleUrls: ['./general-details.component.scss'],
    animations: fuseAnimations

})
export class GeneralDetailsComponent implements OnInit, OnDestroy {

    allInsurance: { [key: string]: Paymentmethods } = {};
    currentpatient: Patient;
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    private insurance: FormArray;

    constructor(private adminservice: AdminService,
                private formBuilder: FormBuilder,
                private notificationservice: NotificationService,
                private core: CoreService,
                private queue: QueueService,
                @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) {

        this.core.allinsurance.subscribe(insurance => {
            this.allInsurance = insurance;
            if (!insurance['0']) {
                return;
            }
            this.allInsurance = insurance;
            /**
             * make sure insurances are already initialized to avoid crazy form errors
             */
            this.queue.currentpatient
                .pipe(takeUntil(this.comopnentDestroyed))
                .subscribe(value => {
                    this.currentpatient = value.patientdata;

                });
        });


    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }

    ngOnInit(): void {
    }
}
