import { Injectable } from '@angular/core';
import { HospitalService } from './hospital.service';
import { Hospital } from '../../models/hospital/Hospital';
import { PaymentChannel, Paymentmethods } from '../../models/payment/PaymentChannel';
import { BehaviorSubject } from 'rxjs';

import * as paymentchannels from 'assets/paymentchannels.json';
import { StitchService } from './stitch/stitch.service';
import { Stream } from 'mongodb-stitch-core-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';

@Injectable({
    providedIn: 'root'
})
export class PaymentmethodService {
    allpaymentchannels: BehaviorSubject<Array<PaymentChannel>> = new BehaviorSubject<Array<PaymentChannel>>([]);
    allinsurance: BehaviorSubject<{ [key: string]: Paymentmethods }> = new BehaviorSubject({});

    /**
     * This keeps a list of all the subscriptions TO THE DATABASE that have been made by this service
     * It's to be maintined as a standard across all services
     */
    subscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();

    constructor(private hospitalservice: HospitalService,
        private stitch: StitchService) {
        this.hospitalservice.activehospital.subscribe(hospital => {

            if (hospital._id) {
                this.getallpaymentchannels();
                // this.addallpaymnetmethods();
            }
        });
    }

    getallpaymentchannels(): void {
        this.stitch.db.collection<PaymentChannel>('paymentchannels')
            .find({})
            .toArray()
            .then(channels => {
                let insurancecompanies = {};
                this.allpaymentchannels.next(channels.map(channel => {
                    if (channel.name === 'insurance') {
                        insurancecompanies = channel.methods;
                    }
                    return channel;
                }));
                this.allinsurance.next(insurancecompanies);
            });
    }

    // addallpaymnetmethods() {
    /**
     * import * as paymentchannels from 'assets/paymentchannels.json';
     */
    // const paymnetmethodkeys = Object.keys(paymentchannels.channels);
    // //
    // const conv = paymnetmethodkeys.map((methodname: string) => {
    //     console.log(methodname);
    //     const channelmethods: Array<Paymentmethods> = paymentchannels.channels[methodname].map(channel => {
    //         return {
    //             imageurl: '',
    //             name: channel.name.toLowerCase()
    //         };
    //     });
    //     const paymentchannel: PaymentChannel = {
    //         name: methodname.toLowerCase(),
    //         _id: null,
    //         /**
    //          * Convert the array to object without giving a fuck
    //          */
    //         // @ts-ignore
    //         methods: { ...channelmethods }
    //     };
    //     return paymentchannel;
    // });
    // console.log(conv);
    // this.stitch.db.collection('paymentchannels').insertMany(conv);
    // }
}
