import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MergedPatientQueueModel} from '../../../models/visit/MergedPatientQueueModel';
import {PaymentChannel} from '../../../models/payment/PaymentChannel';
import {Subject} from 'rxjs';
import {Hospital} from '../../../models/hospital/Hospital';
import {QueueService} from '../../services/core/queue.service';
import {VisitService} from '../../services/visit.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import * as BSON from 'bson';
import {CoreService} from 'app/pages/services/core/core.service';

@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit, OnDestroy {
    allpaymentchannels: Array<PaymentChannel> = [];
    activehospital: Hospital;
    hidden = false;
    private _unsubscribeAll: Subject<any>;

    constructor(private core: CoreService,
                private queue: QueueService,
                private patientvisit: VisitService,
                @Inject(MAT_DIALOG_DATA) public patientdata: MergedPatientQueueModel) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.core.activehospital.subscribe(hosp => {
            this.activehospital = hosp;
        });

        this.core.allpaymentchannels.subscribe(channels => {
            this.allpaymentchannels = channels;
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

    }

    getmethodname(channelid: BSON.ObjectId, methodid: BSON.ObjectId): string {
        return this.allpaymentchannels.find(value => {
            return value._id.toHexString() === channelid.toHexString();
        }).methods[methodid.toHexString()].name;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }


    showPrint(): void {
        this.hidden = true;
        setTimeout(() => {
            window.print();

            setTimeout(() => {
                this.hidden = false;
            }, 2000);
        }, 200);

    }
}
