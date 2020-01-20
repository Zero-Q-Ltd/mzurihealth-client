import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material';
import {fuseAnimations} from '../../../../@fuse/animations';
import {QueueService} from '../../services/core/queue.service';
import {MergedPatientQueueModel} from '../../../models/visit/MergedPatientQueueModel';
import * as moment from 'moment';
import {AdminSelectionComponent} from '../admin-selection/admin-selection.component';
import {HospitalAdmin} from '../../../models/user/HospitalAdmin';
import {FuseConfirmDialogComponent} from '../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import {InvoiceComponent} from '../../patients/invoice/invoice.component';
import {VisitService} from 'app/pages/services/visit.service';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CoreService} from 'app/pages/services/core/core.service';

@Component({
    selector: 'queue-mine',
    templateUrl: './mine.component.html',
    styleUrls: ['./mine.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class MineComponent implements OnInit, OnDestroy {
    patientsdatasource = new MatTableDataSource<MergedPatientQueueModel>();
    patientsheaders = ['FileNo', 'Name', 'Age', 'Phone', 'Last Visit', 'Status', 'Action'];
    dialogRef: MatDialogRef<any>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    constructor(private queue: QueueService,
                private visit: VisitService,
                private core: CoreService,
                public _matDialog: MatDialog) {
        queue.mypatientqueue
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe(value => {
                this.patientsdatasource.data = (Array.from(value.values()) || []).sort((a, b) => {
                    return a.visitData.metadata.edited.date.getMilliseconds() - b.visitData.metadata.edited.date.getMilliseconds();
                });
            });
    }

    ngOnInit(): void {
    }

    getAge(birtday: Date): number {
        return moment().diff(birtday, 'years');
    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }


    acceptpatient(data: MergedPatientQueueModel): void {
        event.stopPropagation();

        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });
        this.confirmDialogRef.componentInstance.confirmMessage = 'Accept?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.visit.acceptPatient(data.visitData._id, this.core.userdata.id);
            }
        });
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
                        // this.queue.assignadmin(data.visitData, res._id);
                    }
                });
            }
        });

    }
}


