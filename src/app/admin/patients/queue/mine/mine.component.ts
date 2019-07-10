import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {QueueService} from '../../../services/queue.service';
import {MergedPatientQueueModel} from '../../../../models/visit/MergedPatientQueueModel';
import * as moment from 'moment';
import {AdminSelectionComponent} from '../admin-selection/admin-selection.component';
import {HospitalAdmin} from '../../../../models/user/HospitalAdmin';
import {FuseConfirmDialogComponent} from '../../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import {InvoiceComponent} from '../../invoice/invoice.component';

@Component({
    selector: 'queue-mine',
    templateUrl: './mine.component.html',
    styleUrls: ['./mine.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class MineComponent implements OnInit {
    patientsdatasource = new MatTableDataSource<MergedPatientQueueModel>();
    patientsheaders = ['FileNo', 'Photo', 'Name', 'ID', 'Age', 'Phone', 'Last Visit', 'Status', 'Action'];
    dialogRef: MatDialogRef<any>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    constructor(private queue: QueueService,
                public _matDialog: MatDialog) {
        queue.mypatientqueue.subscribe(value => {
            this.patientsdatasource.data = value.sort((a, b) => {
                return a.queuedata.metadata.lastEdit.getMilliseconds() - b.queuedata.metadata.lastEdit.getMilliseconds();
            });
        });
    }

    ngOnInit(): void {
    }

    getAge(birtday: Date): number {
        return moment().diff(birtday, 'years');
    }


    acceptpatient(data: MergedPatientQueueModel): void {
        event.stopPropagation();
        this.queue.acceptpatient(data.queuedata);

        // this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
        //     disableClose: false
        // });
        // this.confirmDialogRef.componentInstance.confirmMessage = 'Accept?';
        // this.confirmDialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         this.queue.acceptpatient(data.queuedata);
        //     }
        // });
    }

    viewinvoice(data: MergedPatientQueueModel): void {
        event.stopPropagation();

        this.dialogRef = this._matDialog.open(InvoiceComponent, {
            data: {
                patient: data,
                action: 'save'
            }
        });

        this.dialogRef.afterClosed();
    }

    redirectpatient(data: MergedPatientQueueModel): void {
        event.stopPropagation();

        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });
        this.confirmDialogRef.componentInstance.confirmMessage = 'Redirect patient?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dialogRef = this._matDialog.open(AdminSelectionComponent, {});

                this.dialogRef.afterClosed().subscribe((res: HospitalAdmin) => {
                    console.log(res);
                    if (res) {
                        this.queue.assignadmin(data.queuedata, res._id);
                    }
                });
            }
        });

    }
}


