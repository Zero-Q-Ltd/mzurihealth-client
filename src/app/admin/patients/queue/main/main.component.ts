import {AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {QueueService} from '../../../services/queue.service';
import {MergedPatientQueueModel} from '../../../../models/visit/MergedPatientQueueModel';
import {AdminSelectionComponent} from '../admin-selection/admin-selection.component';
import {HospitalAdmin} from '../../../../models/user/HospitalAdmin';
import {FuseConfirmDialogComponent} from '../../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import {HospitalService} from '../../../services/hospital.service';
import {InvoiceCustomizationComponent} from '../../invoice-customization/invoice-customization.component';

@Component({
    selector: 'queue-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class MainComponent implements OnInit, AfterViewInit {
    patientsdatasource = new MatTableDataSource<MergedPatientQueueModel>();
    patientsheaders = ['FileNo', 'Photo', 'Name', 'ID', 'Age', 'Phone', 'Last Visit', 'Status', 'Action'];
    dialogRef: MatDialogRef<any>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    hospitaladmins: Array<HospitalAdmin>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;


    constructor(private queue: QueueService,
                private  hospitalservice: HospitalService,
                public _matDialog: MatDialog) {
        queue.mainpatientqueue.subscribe(value => {
            this.patientsdatasource.data = value;
        });
        hospitalservice.hospitaladmins.subscribe(admins => {
            this.hospitaladmins = admins;
        });
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        this.patientsdatasource.sort = this.sort;
        this.patientsdatasource.paginator = this.paginator;

    }


    redirectadmin(data: MergedPatientQueueModel): void {
        event.stopPropagation();
        this.showadminchoice(data);
        // this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
        //     disableClose: false
        // });
        // this.confirmDialogRef.componentInstance.confirmMessage = 'Redirect Patient?';
        // this.confirmDialogRef.afterClosed().subscribe(result => {
        //     if (result) {
        //         this.showadminchoice(data);
        //     }
        // });
    }

    showadminchoice(data: MergedPatientQueueModel): void {
        event.stopPropagation();
        this.dialogRef = this._matDialog.open(AdminSelectionComponent, {});

        this.dialogRef.afterClosed().subscribe((res: HospitalAdmin) => {
            console.log(res);
            if (res) {
                this.queue.assignadmin(data.queuedata, res._id);
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
