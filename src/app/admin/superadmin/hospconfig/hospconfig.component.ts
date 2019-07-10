import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {PaymentmethodService} from '../../services/paymentmethod.service';
import {PaymentChannel} from '../../../models/payment/PaymentChannel';
import {emptyhospital, Hospital} from '../../../models/hospital/Hospital';
import {HospitalService} from '../../services/hospital.service';
import {MouseEvent} from '@agm/core';
import {NotificationService} from '../../../shared/services/notifications.service';
import {FuseConfirmDialogComponent} from '../../../../@fuse/components/confirm-dialog/confirm-dialog.component';
import {MatDialog, MatDialogRef} from '@angular/material';
import {emptypaymentmethod} from '../../../models/payment/CustomPaymentMethod.model';
import {LocalcommunicationService} from '../localcommunication.service';
import {fuseAnimations} from '../../../../@fuse/animations';

declare let google: any;

@Component({
    selector: 'app-hospconfig',
    templateUrl: './hospconfig.component.html',
    styleUrls: ['./hospconfig.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class HospconfigComponent implements OnInit {
    /**
     * the payment channels that require collection of transaction details
     */
    customizablepaymentchannels: Array<PaymentChannel>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    defaultlat = -1.2939519;
    defaultlng = 36.8311134;
    zoom = 12;
    temphospital: Hospital = {...emptyhospital};
    originalhspital: Hospital = {...emptyhospital};
    paymentchannels: Array<PaymentChannel> = [];

    constructor(private paymentmethodService: PaymentmethodService,
                private hospitalservice: HospitalService,
                private notificationservice: NotificationService,
                private communicatioservice: LocalcommunicationService,
                private _matDialog: MatDialog) {
        this.paymentmethodService.allpaymentchannels.subscribe(channels => {
            this.customizablepaymentchannels = channels.filter(channel => {
                return channel.transactionDetailCollection;
            });
        });
        /**
         * because this component is ot using reactive forms which is not neccessary, subscribe to tab changes and reset the values so
         * that unsaved changes are ignored and the view is reset to the old values
         */
        communicatioservice.ontabchanged.subscribe(tab => {
            if (tab === 2) {
                this.initvalues();
            }
        });
    }

    initvalues(): void {
        this.hospitalservice.activehospital.subscribe(hosp => {
            // console.log(hosp);
            /**
             * create a new variable
             */
            this.originalhspital = hosp;
            if (hosp.paymentMethods.length < 1) {
                this.originalhspital.paymentMethods.push({...emptypaymentmethod});
            }
            /**
             * TODO : Find a better solution
             * Somehow all the other methods that I've tried are mutating the original value
             * This is just a temporary solution that works but is not the best
             */
            // this.temphospital = JSON.parse(JSON.stringify(this.originalhspital));
            // this.temphospital.location = this.originalhspital.location;

            this.temphospital = {...this.originalhspital};
            /**
             * initialize some vars
             */
            if (!hosp.location) {
                // this.temphospital.location = new firestore.GeoPoint(this.defaultlat, this.defaultlng);
            } else {
                this.defaultlat = hosp.location.latitude;
                this.defaultlng = hosp.location.longitude;
                this.zoom = 15;
            }
        });
    }

    mapClicked($event: MouseEvent): void {
        // const location: BSON.geo = new firestore.GeoPoint($event.coords.lat, $event.coords.lng);
        // this.temphospital.location = location;
    }

    ngOnInit(): void {

    }

    changestosave(): boolean {
        return JSON.stringify(this.temphospital) === JSON.stringify(this.originalhspital);
    }

    sync(): void {
        this.paymentmethodService.addallpaymnetmethods();
    }

    savehospitalchanges(): void {
        this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });
        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to save these changes?';
        this.confirmDialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.hospitalservice.savehospitalchanges(this.temphospital).then(() => {

                    this.notificationservice.notify({
                        placement: {
                            vertical: 'top',
                            horizontal: 'right'
                        },
                        title: 'SAVED',
                        alertType: 'success',
                        body: ''
                    });
                });
            }
        });
    }

    addpaymentarray(): void {
        this.temphospital.paymentMethods.push({...emptypaymentmethod});
    }

    getpaymentchannel(id: string): PaymentChannel | null {
        if (!id) {
            return null;
        }
        const paymentchannel = this.customizablepaymentchannels.find(channel => {
            return channel.id === id;
        });
        return paymentchannel;
    }

    deletepayment(index: number): void {
        this.temphospital.paymentMethods.splice(index, 1);
    }
}
