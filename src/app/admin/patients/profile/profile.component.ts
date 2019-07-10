import {Component, Inject, OnInit, Optional} from '@angular/core';
import {Paymentmethods} from '../../../models/payment/PaymentChannel';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Insurance, Patient} from '../../../models/patient/Patient';
import {AdminService} from '../../services/admin.service';
import {PatientService} from '../../services/patient.service';
import {NotificationService} from '../../../shared/services/notifications.service';
import {PaymentmethodService} from '../../services/paymentmethod.service';
import {QueueService} from '../../services/queue.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import * as moment from 'moment';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    allInsurance: { [key: string]: Paymentmethods } = {};
    patientsForm: FormGroup;
    currentpatient: Patient;
    // private medicalInfo: FormGroup;
    loading = true;
    private personalinfo: FormGroup;
    private nextofkin: FormGroup;
    // doctor will do this
    private insurance: FormArray;

    constructor(private adminservice: AdminService,
                private patientservice: PatientService,
                private formBuilder: FormBuilder,
                private notificationservice: NotificationService,
                private paymentethods: PaymentmethodService,
                private queue: QueueService,
                public dialogRef: MatDialogRef<any>,
                @Optional() @Inject(MAT_DIALOG_DATA) private data: string) {

        this.paymentethods.allinsurance.subscribe(insurance => {
            this.allInsurance = insurance;
            if (!insurance['0']) {
                return;
            }
            /**
             * make sure insurances are already initialized to avoid crazy form errors
             */
            this.patientservice.getpatientbyid(this.data).then((value: Patient) => {

                /**
                 * check if this is an empty patient before
                 */
                if (!value._id) {
                    return;
                }
                this.initFormBuilder();
                this.loading = false;

                this.currentpatient = value;
                this.patientsForm.controls['personaLinfo']
                    .get('fileno').patchValue(value.fileInfo.no);

                // this.patientsForm.controls['personaLinfo']
                //     .get('fileno').disable({onlySelf: true});

                this.patientsForm.controls['personaLinfo']
                    .get('firstName').patchValue(value.personalInfo.name.split(' ')[0]);

                this.patientsForm.controls['personaLinfo']
                    .get('lastName').patchValue(value.personalInfo.name.split(' ')[1]);

                this.patientsForm.controls['personaLinfo']
                    .get('idNo').patchValue(value.personalInfo.idno);

                this.patientsForm.controls['personaLinfo']
                    .get('gender').patchValue(value.personalInfo.gender);

                this.patientsForm.controls['personaLinfo']
                    .get('birth').patchValue(value.personalInfo.dob);

                this.patientsForm.controls['personaLinfo']
                    .get('email').patchValue(value.personalInfo.email);

                this.patientsForm.controls['personaLinfo']
                    .get('workplace').patchValue(value.personalInfo.workplace);

                this.patientsForm.controls['personaLinfo']
                    .get('phone').patchValue(value.personalInfo.phone);

                this.patientsForm.controls['personaLinfo']
                    .get('address').patchValue(value.personalInfo.address);

                this.patientsForm.controls['personaLinfo']
                    .get('occupation').patchValue(value.personalInfo.occupation);

                this.patientsForm.controls['nextofKin']
                    .get('relationship').patchValue(value.nextofKin.relationship);

                this.patientsForm.controls['nextofKin']
                    .get('name').patchValue(value.nextofKin.name);

                this.patientsForm.controls['nextofKin']
                    .get('phone').patchValue(value.nextofKin.phone);

                this.patientsForm.controls['nextofKin']
                    .get('workplace').patchValue(value.nextofKin.workplace);


                console.log('magic insurance');
                console.log(value.insurance);

                value.insurance.forEach(i => {
                    if (i.id !== '') {
                        this.insurance.push(this.replicateInsurance(i));
                    }
                    this.insurancechanges();
                });

            });
        });


    }

    getTime(): any {
        return moment().format('LLL');
    }

    ngOnInit(): void {
    }

    getage(dob): number {
        return moment().diff(dob, 'years');
    }

    submitPatientsForm(): void {
        if (this.patientsForm.valid) {


            this.patientservice.updatePatient(this.currentpatient._id, this.patientsForm.getRawValue()).then(() => {
                this.notificationservice.notify({
                    alertType: 'success',
                    body: 'Saved',
                    title: 'Success',
                    placement: {
                        horizontal: 'right',
                        vertical: 'top'
                    }
                });
                this.dialogRef.close();

            });
        } else {
            this.notificationservice.notify({
                alertType: 'error',
                body: 'Please fill all the required inputs',
                title: 'ERROR',
                placement: {
                    horizontal: 'center',
                    vertical: 'bottom'
                }
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

    replicateInsurance(insurancedata: Insurance): FormGroup {

        const insurancex = new FormControl({
            value: insurancedata.id,
            disabled: false
        });
        const insurancenumber = new FormControl({
            value: insurancedata.insuranceNo,
            disabled: false
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
        const userPhone = new FormControl('', Validators.required);
        const address = new FormControl('', Validators.compose([
            Validators.required
        ]));

        const fileno = new FormControl('', Validators.required);

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
        const kinWorkplace = new FormControl('', Validators.required);

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
            insurance: this.formBuilder.array([]),
            nextofkin: this.nextofkin,
            personalinfo: this.personalinfo
        });


        /*
        * init the insurance list
        * **/
        this.insurance = this.patientsForm.get('insurance') as FormArray;
    }

}
