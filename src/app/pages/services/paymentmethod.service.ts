import { Injectable } from '@angular/core';
import { Stream } from 'mongodb-stitch-core-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';
import { BehaviorSubject } from 'rxjs';
import { PaymentChannel, Paymentmethods } from '../../models/payment/PaymentChannel';
import { CoreService } from './core/core.service';
import { StitchService } from './stitch/stitch.service';


@Injectable({
    providedIn: 'root'
})
export class PaymentmethodService {

    paymentChannelsCollection = this.stitch.db.collection<PaymentChannel>('paymentchannels');

    constructor(private core: CoreService,
        private stitch: StitchService) {

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
