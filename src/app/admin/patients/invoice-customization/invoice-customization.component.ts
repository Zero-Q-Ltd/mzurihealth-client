import {Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {QueueService} from '../../services/queue.service';
import {PatientvisitService} from '../../services/patientvisit.service';
import {emptymergedQueueModel, MergedPatientQueueModel} from '../../../models/visit/MergedPatientQueueModel';
import {emptyprocedureperformed, Procedureperformed} from '../../../models/procedure/Procedureperformed';
import {PaymentmethodService} from '../../services/paymentmethod.service';
import {PaymentChannel, Paymentmethods} from '../../../models/payment/PaymentChannel';
import {HospitalService} from '../../services/hospital.service';
import {PaymentMethod} from '../../../models/payment/CustomPaymentMethod.model';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material';
import {InvoiceComponent} from '../invoice/invoice.component';
import {HospitalAdmin} from '../../../models/user/HospitalAdmin';
import {fuseAnimations} from '../../../../@fuse/animations';
import {ProceduresService} from '../../services/procedures.service';
import {NotificationService} from '../../../shared/services/notifications.service';
import {FuseConfirmDialogComponent} from '../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import {PrescriptionComponent} from '../prescription/prescription.component';

@Component({
    selector: 'app-invoice-payment',
    templateUrl: './invoice-customization.component.html',
    styleUrls: ['./invoice-customization.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class InvoiceCustomizationComponent implements OnInit {
    patientdata: MergedPatientQueueModel = {...emptymergedQueueModel};
    allpaymentchannels: Array<PaymentChannel> = [];
    hospitalmethods: Array<PaymentMethod> = [];
    dialogRef: MatDialogRef<any>;
    clickedprocedure: Procedureperformed = {...emptyprocedureperformed};
    hospitaladmins: Array<HospitalAdmin> = [];
    proceduresdatasouce: MatTableDataSource<Procedureperformed> = new MatTableDataSource<Procedureperformed>();
    procedureheaders = ['name', 'admin-time', 'payment-method', 'cost'];
    paymentmethodheaders = ['channel', 'amount', 'transactionId'];
    multipayment = false;
    selectedinsurance: Paymentmethods;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    disableprecriptionbutton = true;

    constructor(private queue: QueueService,
                private hospital: HospitalService,
                private visitservice: PatientvisitService,
                private paymentmethodService: PaymentmethodService,
                private hospitalservice: HospitalService,
                public _matDialog: MatDialog,
                private procedureservice: ProceduresService,
                private notifications: NotificationService,
                public thisdialogRef: MatDialogRef<InvoiceCustomizationComponent>,
                @Inject(MAT_DIALOG_DATA) public patient: string) {


        hospitalservice.hospitaladmins.subscribe(admins => {
            this.hospitaladmins = admins;
        });

        /**
         * make sure the payment methods have been fetched before fetching the queue info,
         */
        this.paymentmethodService.allpaymentchannels.subscribe(channels => {
            this.allpaymentchannels = channels;
            this.getqueueinfo();
        });
        this.hospital.activehospital.subscribe(hosp => {
            this.hospitalmethods = hosp.paymentMethods;
        });
    }

    getqueueinfo(): void {
        /**
         * Subscribe so that other admin changes are immediately reflected
         */
        this.queue.mainpatientqueue.subscribe(queuedata => {
            queuedata.filter(value => {
                if (value.patientdata._id === this.patient) {
                    this.patientdata = value;
                    this.proceduresdatasouce.data = value.queuedata.procedures;
                    if (this.allpaymentchannels.length > 0) {
                        /**
                         * Calculate the totals with the first pre-selected channel
                         */
                        this.setchannel(this.allpaymentchannels.filter(channel => channel.id === value.queuedata.payment.singlePayment.channelId)[0]);
                    }
                }
            });
        });
    }


    getpaymentamount(customprocedureid: string, insuranceid ?: string): number {
        if (insuranceid) {
            /**
             * check if the procedure contains a custom price for insurance
             */
            if (!!this.procedureservice.hospitalprocedures.value.find(value => {
                return value.customProcedure.id === customprocedureid && value.customProcedure.customInsurancePrice && !!value.customProcedure.insurancePrices[insuranceid];
            })) {
                return this.procedureservice.hospitalprocedures.value.find(value => {
                    return value.customProcedure.id === customprocedureid && !!value.customProcedure.insurancePrices[insuranceid];
                }).customProcedure.insurancePrices[insuranceid];

            } else {
                /**
                 * return the normal price
                 */
                return this.procedureservice.hospitalprocedures.value.find(value => {
                    return value.customProcedure.id === customprocedureid;
                }).customProcedure.regularPrice;
            }
        } else {
            /**
             * return the normal price
             */
            return this.procedureservice.hospitalprocedures.value.find(value => {
                return value.customProcedure.id === customprocedureid;
            }).customProcedure.regularPrice;
        }
    }

    preview(): void {
        this.dialogRef = this._matDialog.open(InvoiceComponent, {
            data: this.patient,
            width: '75%'
        });

        this.dialogRef.afterClosed();
    }

    selectprocedure(procedure): void {
        if (this.patientdata.queuedata.payment.splitPayment) {
            this.clickedprocedure = procedure;
        }
    }

    togglechange(): void {

        setTimeout(() => {
            this.notifications.notify({
                placement: {
                    vertical: 'bottom',
                    horizontal: 'right'
                },
                title: 'Info',
                alertType: 'info',
                body: 'Coming soon...'
            });
            this.patientdata.queuedata.payment.splitPayment = false;
        }, 800);

    }

    setchannel(channel: PaymentChannel): void {
        this.patientdata.queuedata.payment.singlePayment = {
            amount: 0,
            channelId: channel.id,
            methodId: '',
            transactionId: ''
        };
        const isinsurance = channel.name === 'insurance';
        if (!isinsurance) {
            this.patientdata.queuedata.payment.hasInsurance = null;
        }else {
            /**
             * @TODO: find a way of selecting the insurance
             */
        }
        let total = 0;
        this.patientdata.queuedata.procedures.map(value => {
            const amount = this.getpaymentamount(value.customProcedureId);
            value.payment = {
                amount: amount,
                methods: [{
                    amount: amount,
                    channelid: channel.id,
                    methidid: '',
                    transactionid: ''
                }],
                hasInsurance: isinsurance
            };
            total += amount;
        });
        this.patientdata.queuedata.payment.total = total;
    }

    getcativechannelmethods(channelid: string): Array<PaymentMethod> {
        return this.hospitalmethods.filter(value => {
            return value.paymentChannelId === channelid;
        });
    }

    getmethodname(channelid: string, methodid: string): string {
        return this.allpaymentchannels.find(value => {
            return value.id === channelid;
        }).methods[methodid].name;
    }

    insurancename(insuranceid: string): string {
        return this.allpaymentchannels.find(value => {
            return value.name === 'insurance';
        }).methods[insuranceid].name;
    }


    selectinsurance(insurance): void {
        this.selectedinsurance = insurance;
        this.patientdata.queuedata.payment.hasInsurance = true;
        let total = 0;
        this.patientdata.queuedata.procedures.map(value => {
            const amount = this.getpaymentamount(value.customProcedureId, insurance._id);
            value.payment = {
                amount: amount,
                methods: [{
                    amount: amount,
                    channelid: '',
                    methidid: insurance._id,
                    transactionid: ''
                }],
                hasInsurance: true
            };
            total += amount;
        });
        this.patientdata.queuedata.payment.total = total;
        this.patientdata.queuedata.payment.singlePayment.amount = total;
    }


    channelconfigured(channelid: string): boolean {
        return !!this.hospitalmethods.filter(value => {
            return value.paymentChannelId === channelid;
        });
    }

    togglemultipayment(): void {

        setTimeout(() => {
            this.notifications.notify({
                placement: {
                    vertical: 'bottom',
                    horizontal: 'right'
                },
                title: 'Info',
                alertType: 'info',
                body: 'Coming soon...'
            });
            this.multipayment = false;
        }, 800);

    }

    printprescription(): void {
        this.dialogRef = this._matDialog.open(PrescriptionComponent, {
            data: this.patient
        });

        this.dialogRef.afterClosed();
    }

    pay(): void {
        if (!this.patientdata.queuedata.checkin.admin) {
            this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
                disableClose: false
            });

            this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to pay for the Invoice and exit the patient??';
            this.confirmDialogRef.afterClosed().subscribe(result => {
                if (result) {
                    this.visitservice.payandexit(this.patientdata.queuedata);
                    this.thisdialogRef.close();
                }
            });
        } else {
            this.notifications.notify({
                placement: {
                    vertical: 'bottom',
                    horizontal: 'center'
                },
                title: 'Error',
                alertType: 'error',
                body: 'Patient visit is in progress'
            });
        }
    }

    ngOnInit(): void {
    }

}
