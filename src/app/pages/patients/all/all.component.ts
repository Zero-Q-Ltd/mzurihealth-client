import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '../../../../@fuse/animations';
import { MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Patient } from '../../../models/patient/Patient';
import * as moment from 'moment';
import { HospitalAdmin } from '../../../models/user/HospitalAdmin';
import { emptyhospital, Hospital } from '../../../models/hospital/Hospital';
import { PatientService } from '../../services/patient.service';
import { HospitalService } from '../../services/hospital.service';
import { PushqueueComponent } from '../pushqueue/pushqueue.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/services/notifications.service';
import { Router } from '@angular/router';
import { PaymentmethodService } from '../../services/paymentmethod.service';
import { Paymentmethods } from '../../../models/payment/PaymentChannel';
import { QueueService } from '../../services/core/queue.service';
import { ProfileComponent } from '../profile/profile.component';
import { FuseConfirmDialogComponent } from '../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import { NewVisit } from 'app/models/visit/Visit';
import { CoreService } from 'app/pages/services/core/core.service';

@Component({
    selector: 'all-patients',
    templateUrl: './all.component.html',
    styleUrls: ['./all.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AllComponent implements OnInit, AfterViewInit {
    patientsdatasource = new MatTableDataSource<Patient>();
    patientsheaders = ['FileNo', 'Photo', 'name', 'ID', 'Age', 'Phone', 'Last Visit', 'Status'];
    activehospital: Hospital = Object.assign({}, emptyhospital);
    hospitaladmins: Array<HospitalAdmin> = [];
    userdata: HospitalAdmin;
    dialogRef: any;
    allInsurance: { [key: string]: Paymentmethods } = {};
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    searchForm: FormGroup;

    @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
    @ViewChild(MatSort, { static: false }) sort: MatSort;


    constructor(private core: CoreService,
        private patientservice: PatientService,
        private hospitalservice: HospitalService,
        private paymentethods: PaymentmethodService,
        private notificationservice: NotificationService,
        private dialog: MatDialog,
        private queueService: QueueService,
        private formBuilder: FormBuilder,
        public _matDialog: MatDialog, private router: Router) {

        this.core.activeHospital.subscribe(hospital => {
            if (hospital._id) {
                this.activehospital = hospital;
            }
        });
        this.queueService.mainpatientsqueue.subscribe();

        this.core.allinsurance.subscribe(insurance => {
            this.allInsurance = insurance;
        });
        this.core.observableUserData.subscribe((admin: HospitalAdmin) => {
            if (admin.id) {
                this.userdata = admin;
            }
        });
        this.patientservice.getHospitalPatients(this.core.activeHospitalId).subscribe(patients => {
            this.patientsdatasource.data = patients;
        });

        this.initialSearchForm();
    }

    ngOnInit(): void {

    }

    ngAfterViewInit(): void {
        this.patientsdatasource.sort = this.sort;
        this.patientsdatasource.paginator = this.paginator;

    }

    getAge(birtday: Date): number {
        return moment().diff(birtday, 'years');
    }

    addToQueue(patient: Patient): void {

        const fil = this.queueService.mainpatientsqueue.value.has(patient._id.toHexString());
        if (fil) {
            this.notificationservice.notify({
                alertType: 'warning',
                body: 'The patient is already in the queue',
                title: 'Warning',
                placement: { horizontal: 'center', vertical: 'top' }
            });
            return;
        }
        this.dialogRef = this._matDialog.open(PushqueueComponent, {
            panelClass: 'all-patients',
            data: {
                patient: patient,
                action: 'save'
            }
        });

        this.dialogRef.afterClosed()
            .subscribe((response: NewVisit) => {
                if (!response) {
                    return;
                }

                console.log(response);

                this.queueService.addPatientToQueue(response, patient)
                    .then(() => {
                        // navigate to queues
                        this.router.navigate(['/queue']);
                    }).catch(error => {
                        console.log('form error');
                        console.log(error);


                        this.notificationservice.notify({
                            alertType: 'error',
                            body: 'An error occurred',
                            title: 'ERROR',
                            placement: { horizontal: 'right', vertical: 'top' }
                        });
                    });

            });
    }

    editpatient(patient: Patient): void {
        event.stopPropagation();
        this.dialogRef = this._matDialog.open(ProfileComponent, {
            data: patient._id,
            width: '80%'
        });
    }

    deletepatient(patient: Patient): void {
        event.stopPropagation();
        const fil = this.queueService.mainpatientsqueue.value.get(patient._id.toHexString());

        if (fil) {
            this.notificationservice.notify({
                alertType: 'error',
                body: 'You must first exit the patient from queue to delete them',
                title: 'ERROR',
                placement: { horizontal: 'center', vertical: 'top' }
            });
            return;
        }
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });
        this.confirmDialogRef.componentInstance.confirmMessage = 'Delete Patient?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.patientservice.deletepatient(patient._id.toHexString());
            }
        });
    }

    submitSearchForm(): void {
        if (this.searchForm.invalid) {
            return;
        }

        const { field, fieldValue } = this.searchForm.value;
        this.patientservice.searchPatient(field, fieldValue);
    }

    private initialSearchForm(): void {
        this.searchForm = this.formBuilder.group({
            field: new FormControl('', [
                Validators.required,
            ]),
            fieldValue: new FormControl('', [
                Validators.required
            ]),
        });
    }
}
