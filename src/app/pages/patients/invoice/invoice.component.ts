import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Hospital } from '../../../models/hospital/Hospital';
import { VisitService } from '../../services/visit.service';
import { emptymergedQueueModel, MergedPatientQueueModel } from '../../../models/visit/MergedPatientQueueModel';
import { QueueService } from '../../services/core/queue.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { PaymentChannel } from '../../../models/payment/PaymentChannel';
import * as BSON from 'bson';
import { CoreService } from 'app/pages/services/core/core.service';

@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit, OnDestroy {
    patientdata: MergedPatientQueueModel = { ...emptymergedQueueModel };
    allpaymentchannels: Array<PaymentChannel> = [];
    activehospital: Hospital;
    hidden = false;
    private _unsubscribeAll: Subject<any>;

    constructor(private core: CoreService,
        private queue: QueueService,
        private patientvisit: VisitService,
        @Inject(MAT_DIALOG_DATA) public patientid: string) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.core.activeHospital.subscribe(hosp => {
            this.activehospital = hosp;
        });
        /**
         * Subscribe so that other admin changes are immediately reflected
         */
        queue.mainpatientsqueue.subscribe(visitData => {
            // visitData.filter(value => {
            //     if (value.patientdata._id === this.patientid) {
            //         this.patientdata = value;
            //     }
            // });
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
