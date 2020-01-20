import {Component, Inject, OnInit, Optional, ViewEncapsulation} from '@angular/core';
import {Validators} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Router} from '@angular/router';
import {NewPatientForm} from 'app/models/patient/NewPatientForm';
import {Insurance, NextofKin, PersonalInfo} from 'app/models/patient/Patient';
import {CoreService} from 'app/pages/services/core/core.service';
import {FilenumberValidator} from 'app/shared/validators/filenumber.validator';
import * as moment from 'moment';
import {FormArray, FormBuilder, FormControl, FormGroup} from 'ngx-strongly-typed-forms';
import {fuseAnimations} from '../../../../@fuse/animations';
import {emptyfile, HospFile} from '../../../models/hospital/HospFile';
import {emptyhospital, Hospital} from '../../../models/hospital/Hospital';
import {Paymentmethods} from '../../../models/payment/PaymentChannel';
import {NotificationService} from '../../../shared/services/notifications.service';
import {NumberValidator} from '../../../shared/validators/number.validator';
import {AdminService} from '../../services/admin.service';
import {PatientService} from '../../services/patient.service';
import {PaymentmethodService} from '../../services/paymentmethod.service';

@Component({
    selector: 'app-add',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AddComponent implements OnInit {

    patientfileno: HospFile = Object.assign({}, emptyfile);
    activehospital: Hospital = Object.assign({}, emptyhospital);
    allInsurance: { [key: string]: Paymentmethods } = {};
    patientsForm: FormGroup<NewPatientForm>;
    savingUser: Boolean = false;


    maxDate: Date;

    constructor(private adminservice: AdminService,
                private patientservice: PatientService,
                private formBuilder: FormBuilder,
                private core: CoreService,
                private router: Router,
                private paymentethods: PaymentmethodService,
                private notificationservice: NotificationService,
                @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) {

        this.maxDate = moment().toDate();


        /**
         * initialize forms
         * */
        this.initFormBuilder();

        this.core.allinsurance.subscribe(insurance => {
            this.allInsurance = insurance;
        });


        this.core.activehospital.subscribe(hospital => {
            if (hospital._id) {
                this.activehospital = hospital;
                this.patientfileno.no = (hospital.patientCount + 1).toString();

                /**
                 * set the form data and disable it
                 * */
                this.patientsForm.get('fileNo').patchValue(this.patientfileno.no);

                // this.patientsForm.controls['personaLinfo']
                //     .get('fileno').disable({onlySelf: true});
            }
        });


        /**
         *
         * */
        // this.insurancechanges();
        // this.addInsurance()

    }

    getTime(): any {
        return moment().format('LLL');
    }

    ngOnInit(): void {
    }

    submitPatientsForm(): void {

        console.log(this.patientsForm);

        if (this.patientsForm.valid) {
            // this.savingUser = true;

            this.patientservice.savePatient(this.patientsForm.getRawValue()).then(() => {
                console.log('patient added successfully');
                this.savingUser = false;
                this.notificationservice.notify({
                    alertType: 'success',
                    body: 'User was successfully added',
                    title: 'Success',
                    placement: {horizontal: 'right', vertical: 'top'}
                });

                // clear inputs
                this.patientsForm.reset();


                this.router.navigate(['patients/all']);
            });
        } else {
            this.savingUser = false;
            this.notificationservice.notify({
                alertType: 'error',
                body: 'Please fill all the required inputs',
                title: 'ERROR',
                placement: {horizontal: 'right', vertical: 'top'}
            });
        }
    }

    insurancechanges(): void {
        this.getinsuranceArray().controls.forEach(x => {
            x.get('id').valueChanges.subscribe(g => {
                if (g) {
                    if (x.get('id').value.toString().length > -1) {
                        x.get('insuranceNo').enable({emitEvent: false});
                    } else {
                        x.get('insuranceNo').disable({emitEvent: false});
                    }
                }
            });
        });
    }

    /**
     * Retruns the form array for dynamic manipulation
     */
    getinsuranceArray(): FormArray<Insurance> {
        return this.patientsForm.get('insurance') as FormArray<Insurance>;
    }

    addInsurance(): void {
        this.getinsuranceArray().push(this.formBuilder.group<Insurance>({
            id: [''],
            insuranceNo: new FormControl({
                value: '',
                disabled: true
            })
        }));
        this.insurancechanges();
    }

    removeInsurance(index: number): void {
        if (index === 0) {
            // clear the insurance input
            this.getinsuranceArray().at(index).get('id').patchValue(undefined);
            this.getinsuranceArray().at(index).get('id').markAsUntouched();
            this.getinsuranceArray().at(index).get('insuranceNo').patchValue(undefined);
            this.getinsuranceArray().at(index).get('insuranceNo').disable();
            return;
        }

        this.getinsuranceArray().removeAt(index);
    }

    /**
     * Init form values inside a here.
     * */
    private initFormBuilder(): void {
        this.patientsForm = this.formBuilder.group<NewPatientForm>({
            insurance: this.formBuilder.array([]),
            nextofKin: this.formBuilder.group<NextofKin>({
                name: ['', Validators.required],
                relationship: ['', Validators.required],
                phone: ['', Validators.compose([Validators.required, NumberValidator.validate()])],
                workplace: ['', Validators.required]
            }),
            personalInfo: this.formBuilder.group<PersonalInfo>({
                name: ['', Validators.required],
                occupation: '',
                idno: ['', Validators.required],
                gender: [0, Validators.required],
                dob: [null, Validators.required],
                email: ['', Validators.compose([Validators.email])],
                workplace: ['', Validators.required],
                phone: ['', Validators.compose([Validators.required, NumberValidator.validate()])],
                address: ['', Validators.compose([Validators.required])],
                photoURL: ''
            }),
            fileNo: ['',
                Validators.required,
                FilenumberValidator.validate(this.patientservice)]
        });


        /*
        * init the insurance list
        * **/
        // this.insurance = this.patientsForm.get('insurance') as FormArray;
    }
}
