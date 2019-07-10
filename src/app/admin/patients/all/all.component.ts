import {AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {fuseAnimations} from '../../../../@fuse/animations';
import {MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Patient} from '../../../models/patient/Patient';
import * as moment from 'moment';
import {HospitalAdmin} from '../../../models/user/HospitalAdmin';
import {emptyhospital, Hospital} from '../../../models/hospital/Hospital';
import {AdminService} from '../../services/admin.service';
import {PatientService} from '../../services/patient.service';
import {HospitalService} from '../../services/hospital.service';
import {PushqueueComponent} from '../pushqueue/pushqueue.component';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {NotificationService} from '../../../shared/services/notifications.service';
import {Router} from '@angular/router';
import {PaymentmethodService} from '../../services/paymentmethod.service';
import {Paymentmethods} from '../../../models/payment/PaymentChannel';
import {QueueService} from '../../services/queue.service';
import {ProfileComponent} from '../profile/profile.component';
import {FuseConfirmDialogComponent} from '../../../../@fuse/components/confirm-dialog/confirm-dialog.component';

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

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;


    constructor(private adminservice: AdminService,
                private patientservice: PatientService,
                private hospitalservice: HospitalService,
                private paymentethods: PaymentmethodService,
                private notificationservice: NotificationService,
                private dialog: MatDialog,
                private queueService: QueueService,
                private formBuilder: FormBuilder,
                public _matDialog: MatDialog, private router: Router) {

        this.hospitalservice.activehospital.subscribe(hospital => {
            if (hospital._id) {
                this.activehospital = hospital;
            }
        });
        this.queueService.mainpatientqueue.subscribe();

        this.paymentethods.allinsurance.subscribe(insurance => {
            this.allInsurance = insurance;
        });
        adminservice.observableuserdata.subscribe((admin: HospitalAdmin) => {
            if (admin.data.uid) {
                this.userdata = admin;
            }
        });
        this.patientservice.hospitalpatients.subscribe(patients => {
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

        const fil = this.queueService.mainpatientqueue.value.filter(value => {
            return value.patientdata._id === patient._id;
        });

        if (fil.length !== 0) {
            this.notificationservice.notify({
                alertType: 'warning',
                body: 'The patient is already in the queue',
                title: 'Warning',
                placement: {horizontal: 'center', vertical: 'top'}
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
            .subscribe(response => {
                if (!response) {
                    return;
                }
                const actionType: string = response[0];
                const formData: { data: FormGroup, selected: { insuranceControl: string, insurancenumber: string } } = response[1];

                console.log(formData.data.getRawValue());

                switch (actionType) {
                    /**
                     * Save
                     */

                    case 'save':
                        this.patientservice.addPatientToQueue(formData.data.getRawValue(), patient, formData.selected)
                            .then(() => {
                                // navigate to queues
                                this.router.navigate(['admin/patients/queue']);
                            }).catch(error => {
                            console.log('form error');
                            console.log(error);


                            this.notificationservice.notify({
                                alertType: 'error',
                                body: 'An error occurred',
                                title: 'ERROR',
                                placement: {horizontal: 'right', vertical: 'top'}
                            });
                        });

                        break;
                }
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
        const fil = this.queueService.mainpatientqueue.value.filter(value => {
            return value.patientdata._id === patient._id;
        });

        if (fil.length !== 0) {
            this.notificationservice.notify({
                alertType: 'error',
                body: 'You must first exit the patient from queue to delete them',
                title: 'ERROR',
                placement: {horizontal: 'center', vertical: 'top'}
            });
            return;
        }
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });
        this.confirmDialogRef.componentInstance.confirmMessage = 'Delete Patient?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.patientservice.deletepatient(patient._id);
            }
        });
    }

    submitSearchForm(): void {
        if (this.searchForm.invalid) {
            return;
        }

        const {field, fieldValue} = this.searchForm.value;
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
