import {Pipe, PipeTransform} from '@angular/core';
import {PaymentChannel} from '../../models/payment/PaymentChannel';
import * as BSON from 'bson';

@Pipe({
    name: 'paymentmethod'
})
export class PaymentmethodPipe implements PipeTransform {

    transform(allpaymentchannels: Array<PaymentChannel>, channelid: BSON.ObjectId, methodid: BSON.ObjectId): string {
        return allpaymentchannels.length > 0 ? allpaymentchannels.find(value => {
            return value._id.toHexString() === channelid.toHexString();
        }).methods[methodid.toHexString()].name : '';
    }

}
