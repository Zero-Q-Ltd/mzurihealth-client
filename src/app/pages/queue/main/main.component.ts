import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {fuseAnimations} from '../../../../@fuse/animations';
import {QueueService} from '../../services/core/queue.service';
import {MergedPatientQueueModel} from '../../../models/visit/MergedPatientQueueModel';
import {AdminSelectionComponent} from '../admin-selection/admin-selection.component';
import {HospitalAdmin} from '../../../models/user/HospitalAdmin';
import {FuseConfirmDialogComponent} from '../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import {InvoiceCustomizationComponent} from '../../patients/invoice-customization/invoice-customization.component';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CoreService} from 'app/pages/services/core/core.service';

@Component({
    selector: 'queue-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {
    patientsdatasource = new MatTableDataSource<MergedPatientQueueModel>();
    patientsheaders = ['FileNo', 'Name', 'Age', 'Phone', 'Last Visit', 'Status', 'Action'];
    dialogRef: MatDialogRef<any>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    hospitaladmins: Array<HospitalAdmin>;
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
    @ViewChild(MatSort, {static: false}) sort: MatSort;


    constructor(private queue: QueueService,
                private core: CoreService,
                public _matDialog: MatDialog) {
        queue.mainpatientsqueue
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe(value => {
                this.patientsdatasource.data = Array.from(value.values()) || [];
            });
        this.core.hospitaladmins.subscribe(admins => {
            this.hospitaladmins = admins;
        });
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
    }


    ngAfterViewInit(): void {
        this.patientsdatasource.sort = this.sort;
        this.patientsdatasource.paginator = this.paginator;

    }


    redirectadmin(data: MergedPatientQueueModel): void {
        event.stopPropagation();
        this.showadminchoice(data);
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });
        this.confirmDialogRef.componentInstance.confirmMessage = 'Redirect Patient?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.showadminchoice(data);
            }
        });
    }

    showadminchoice(data: MergedPatientQueueModel): void {
        event.stopPropagation();
        this.dialogRef = this._matDialog.open(AdminSelectionComponent, {});

        this.dialogRef.afterClosed().subscribe((res: HospitalAdmin) => {
            console.log(res);
            if (res) {
                this.queue.assignadmin(data.visitData, res.id);
            }
        });
    }

    customizeInvoice(data: MergedPatientQueueModel): void {
        event.stopPropagation();
        this.dialogRef = this._matDialog.open(InvoiceCustomizationComponent, {
            data: data.patientdata._id,
            width: '90%'
        });

        this.dialogRef.afterClosed();
    }

    payinvoice(data: MergedPatientQueueModel): void {

    }

}
