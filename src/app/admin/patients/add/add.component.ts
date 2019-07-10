import {Component, Inject, OnInit, Optional, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {NotificationService} from '../../../shared/services/notifications.service';
import {AdminService} from '../../services/admin.service';
import {PatientService} from '../../services/patient.service';
import {HospitalService} from '../../services/hospital.service';
import {emptyhospital, Hospital} from '../../../models/hospital/Hospital';
import {emptyfile, HospFile} from '../../../models/hospital/file';
import * as moment from 'moment';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {fuseAnimations} from '../../../../@fuse/animations';
import {Router} from '@angular/router';
import {Paymentmethods} from '../../../models/payment/PaymentChannel';
import {PaymentmethodService} from '../../services/paymentmethod.service';
import {NumberValidator} from '../../validators/number.validator';
import {FilenumberValidator} from '../../validators/filenumber.validator';

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
    patientsForm: FormGroup;

    personalinfo: FormGroup;
    nextofkin: FormGroup;
    insurance: FormArray;
    // doctor will do this
    // private medicalInfo: FormGroup;

    savingUser: Boolean = false;


    maxDate: Date;

    constructor(private adminservice: AdminService,
                private patientservice: PatientService,
                private formBuilder: FormBuilder,
                private hospitalservice: HospitalService,
                private router: Router,
                private paymentethods: PaymentmethodService,
                private notificationservice: NotificationService,
                @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) {

        this.maxDate = moment().toDate();


        /**
         * initialize forms
         * */
        this.initFormBuilder();

        this.paymentethods.allinsurance.subscribe(insurance => {
            this.allInsurance = insurance;
        });


        this.hospitalservice.activehospital.subscribe(hospital => {
            if (hospital._id) {
                this.activehospital = hospital;
                this.patientfileno.no = (hospital.patientCount + 1).toString();

                /**
                 * set the form data and disable it
                 * */
                this.patientsForm.controls['personaLinfo']
                    .get('fileno').patchValue(this.patientfileno.no);

                // this.patientsForm.controls['personaLinfo']
                //     .get('fileno').disable({onlySelf: true});
            }
        });


        /**
         *
         * */
        this.insurancechanges();

    }

    getTime(): any {
        return moment().format('LLL');
    }

    ngOnInit(): void {
    }

    submitPatientsForm(): void {

        console.log(this.patientsForm);

        if (this.patientsForm.valid) {
            this.savingUser = true;

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


                this.router.navigate(['admin/patients/all']);
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

    createInsurance(): FormGroup {
        const insurancex = new FormControl('');

        const insurancenumber = new FormControl({
            value: '',
            disabled: true
        });

        return this.formBuilder.group({
            id: insurancex,
            insurancenumber: insurancenumber
        });
    }

    insurancechanges(): void {

        this.insurance.controls.forEach(x => {
            x.get('_id').valueChanges.subscribe(g => {
                if (g) {
                    if (x.get('_id').value.toString().length > -1) {
                        x.get('insurancenumber').enable({emitEvent: false});
                    } else {
                        x.get('insurancenumber').disable({emitEvent: false});
                    }
                }
            });
        });
    }

    addInsurance(): void {
        this.insurance.push(this.createInsurance());
        this.insurancechanges();
    }

    removeInsurance(index: number): void {
        if (index === 0) {
            // clear the insurance input
            this.insurance.at(index).get('_id').patchValue(undefined);
            this.insurance.at(index).get('_id').markAsUntouched();
            this.insurance.at(index).get('insurancenumber').patchValue(undefined);
            this.insurance.at(index).get('insurancenumber').disable();
            return;
        }

        this.insurance.removeAt(index);
    }

    /**
     * Init form values inside a here.
     * */
    private initFormBuilder(): void {

        /**
         * personal information
         * */
        const firstname = new FormControl('', Validators.required);
        const lastname = new FormControl('', Validators.required);
        const occupation = new FormControl('');
        const idno = new FormControl('', Validators.required);
        const gender = new FormControl('', Validators.required);
        const birth = new FormControl('', Validators.required);
        const email = new FormControl('', Validators.compose([
            Validators.email
        ]));
        const userWorkplace = new FormControl('', Validators.required);
        const userPhone = new FormControl('', Validators.compose([
            Validators.required,
            NumberValidator.validate()
        ]));
        const address = new FormControl('', Validators.compose([
            Validators.required

        ]));


        // const fileno = new FormControl('', {
        //     validators: [Validators.required],
        //     asyncValidators: [FilenumberValidator.validate(this.patientservice)]
        // });

        const fileno = new FormControl('',
            Validators.required,
            FilenumberValidator.validate(this.patientservice));


        this.personalinfo = new FormGroup({
            firstname: firstname,
            lastname: lastname,
            occupation: occupation,
            idno: idno,
            gender: gender,
            birth: birth,
            email: email,
            workplace: userWorkplace,
            phone: userPhone,
            address: address,
            fileno: fileno
        });


        /**
         * next of kin
         * **/

        const relationship = new FormControl('', Validators.required);
        const kinName = new FormControl('', Validators.required);
        const kinPhone = new FormControl('', Validators.required);
        const kinWorkplace = new FormControl('', Validators.compose([
            Validators.required
        ]));

        this.nextofkin = new FormGroup({
            relationship: relationship,
            name: kinName,
            phone: kinPhone,
            workplace: kinWorkplace
        });

        /*
        * insurance initial
        * https://alligator.io/angular/reactive-forms-formarray-dynamic-fields/
        * **/

        this.patientsForm = this.formBuilder.group({
            insurance: this.formBuilder.array([this.createInsurance()]),
            nextofkin: this.nextofkin,
            personalinfo: this.personalinfo
        });


        /*
        * init the insurance list
        * **/
        this.insurance = this.patientsForm.get('insurance') as FormArray;
    }
}
