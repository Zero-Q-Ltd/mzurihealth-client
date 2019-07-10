import {Component, Inject, OnInit} from '@angular/core';
import {HospitalService} from '../../services/hospital.service';
import {QueueService} from '../../services/queue.service';
import {PaymentmethodService} from '../../services/paymentmethod.service';
import {PatientvisitService} from '../../services/patientvisit.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import {emptymergedQueueModel, MergedPatientQueueModel} from '../../../models/visit/MergedPatientQueueModel';
import {PaymentChannel} from '../../../models/payment/PaymentChannel';
import {Subject} from 'rxjs';
import {Hospital} from '../../../models/hospital/Hospital';

@Component({
    selector: 'app-prescription',
    templateUrl: './prescription.component.html',
    styleUrls: ['./prescription.component.scss']
})
export class PrescriptionComponent implements OnInit {
    patientdata: MergedPatientQueueModel = {...emptymergedQueueModel};
    allpaymentchannels: Array<PaymentChannel> = [];
    activehospital: Hospital;
    hidden = false;
    private _unsubscribeAll: Subject<any>;

    constructor(private hospitalservice: HospitalService,
                private queue: QueueService,
                private paymentmethodService: PaymentmethodService,
                private patientvisit: PatientvisitService,
                @Inject(MAT_DIALOG_DATA) public patientid: string) {

    }

    ngOnInit() {
    }

}
