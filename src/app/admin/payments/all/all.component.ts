import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {emptyhospital, Hospital} from '../../../models/hospital/Hospital';
import {HospitalAdmin} from '../../../models/user/HospitalAdmin';
import {Paymentmethods} from '../../../models/payment/PaymentChannel';
import {FuseConfirmDialogComponent} from '../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import {FormGroup} from '@angular/forms';
import {fuseAnimations} from '../../../../@fuse/animations';
import {MergedPatientQueueModel} from '../../../models/visit/MergedPatientQueueModel';
import {PatientService} from '../../services/patient.service';
import {QueueService} from '../../services/queue.service';
import {PaymentHistoryService} from '../../services/payment-history.service';
import {InvoiceComponent} from '../invoice/invoice.component';

@Component({
    selector: 'app-all',
    templateUrl: './all.component.html',
    styleUrls: ['./all.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AllComponent implements OnInit {
    viewcriteria: 'day' | 'week' | 'month' | 'year' = 'week';
    patientshistorydatasource = new MatTableDataSource<MergedPatientQueueModel>();
    patientsheaders = ['FileNo', 'Photo', 'name', 'ID', 'Phone', 'Date', 'Procedures', 'Amount'];
    activehospital: Hospital = Object.assign({}, emptyhospital);
    hospitaladmins: Array<HospitalAdmin> = [];
    userdata: HospitalAdmin;
    dialogRef: any;
    allInsurance: { [key: string]: Paymentmethods } = {};
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    searchForm: FormGroup;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(public _matDialog: MatDialog,
                private patientservice: PatientService,
                private queueService: QueueService,
                private paymenthistservice: PaymentHistoryService) {
        paymenthistservice.paymentshistory.subscribe(hist => {
            this.patientshistorydatasource.data = hist;
        });
    }

    viewinvoice(data: MergedPatientQueueModel): void {
        event.stopPropagation();
        this.dialogRef = this._matDialog.open(InvoiceComponent, {
            data: data,
            width: '75%'
        });
        this.dialogRef.afterClosed();
    }

    changecriteria(timeframe: 'day' | 'week' | 'month' | 'year'): void {
        if (this.viewcriteria !== timeframe) {
            this.viewcriteria = timeframe;
            this.paymenthistservice.gethistory(timeframe);
        }
    }

    ngOnInit(): void {
    }

}
