import { Pipe, PipeTransform } from '@angular/core';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import * as BSON from 'bson';

@Pipe({
    name: 'adminName'
})
export class AdminNamePipe implements PipeTransform {
    /**
     * get the admin corresponding to the _id provided
     * @param admins
     * @param adminid
     */

    transform(admins: Array<HospitalAdmin>, adminid: BSON.ObjectId): string {
        if (admins.filter(admin => {
            return admin._id.toHexString() === adminid.toHexString();
        }).length !== 0) {
            return admins.filter(admin => {
                return admin._id.toHexString() === adminid.toHexString();
            })[0].data.displayName;
        } else {
            return '';
        }
    }

}
