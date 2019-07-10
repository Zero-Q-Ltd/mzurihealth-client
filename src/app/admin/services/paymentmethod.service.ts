import {Injectable} from '@angular/core';
import {HospitalService} from './hospital.service';
import {Hospital} from '../../models/hospital/Hospital';
import {PaymentChannel, Paymentmethods} from '../../models/payment/PaymentChannel';
import {BehaviorSubject} from 'rxjs';

// import * as paymentchannels from 'assets/paymentchannels.json';

@Injectable({
    providedIn: 'root'
})
export class PaymentmethodService {
    activehospital: Hospital;
    allpaymentchannels: BehaviorSubject<Array<PaymentChannel>> = new BehaviorSubject<Array<PaymentChannel>>([]);
    allinsurance: BehaviorSubject<{ [key: string]: Paymentmethods }> = new BehaviorSubject({});

    constructor(private hospitalservice: HospitalService) {
        this.hospitalservice.activehospital.subscribe(hospital => {
            if (hospital._id) {
                this.activehospital = hospital;
                this.getallpaymentchannels();
            }
        });
    }

    getallpaymentchannels(): void {
        // this.stitch.db.collection('paymentchannels').onSnapshot(paymentmethodsdata => {
        //     let insurancecompanies = {};
        //     this.allpaymentchannels.next(paymentmethodsdata.docs.map(methodata => {
        //         const paymentChannel = methodata.data() as PaymentChannel;
        //         paymentChannel.id = methodata.id;
        //         if (paymentChannel.name === 'insurance') {
        //             insurancecompanies = paymentChannel.methods;
        //         }
        //         return paymentChannel;
        //     }));
        //     this.allinsurance.next(insurancecompanies);
        // });
    }

    async addallpaymnetmethods(): Promise<void> {
        /**
         * import * as paymentchannels from 'assets/paymentchannels.json';
         */
        // const paymnetmethodkeys = Object.keys(paymentchannels.channels);
        // const batch = this.db.firestore.batch();
        //
        // paymnetmethodkeys.forEach(async (methodname: string) => {
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
        //         methods: {...channelmethods}
        //     };
        //     batch.set(this.db.firestore.collection('paymentchannels').doc(this.db.createId()), paymentchannel);
        // });
        // return await batch.commit();
    }
}
