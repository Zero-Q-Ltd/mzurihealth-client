import { Injectable } from '@angular/core';
import { AdminService } from './admin.service';
import { BehaviorSubject } from 'rxjs';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { emptyhospital, Hospital } from '../../models/hospital/Hospital';
import { AdminInvite, emptyadmininvite } from '../../models/user/AdminInvite';
import { StitchService } from './stitch/stitch.service';
import { Stream } from 'mongodb-stitch-core-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';
import { distinctUntilChanged, skipWhile } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class HospitalService {
    hospitaladmins: BehaviorSubject<HospitalAdmin[]> = new BehaviorSubject([]);
    activehospital: BehaviorSubject<Hospital> = new BehaviorSubject<Hospital>({ ...emptyhospital });
    hospitalerror: boolean;

    /**
     * This keeps a list of all the subscriptions TO THE DATABASE that have been made by this service
     * It's to be maintined as a standard across all services
     */
    subscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();
    constructor(private adminservice: AdminService,
        private stitch: StitchService) {
        /**
         * only re-fetch the hospital if the admin id or the assigned hospital id changes
         */
        adminservice.observableuserdata.pipe(
            skipWhile(t => !t.id),
            distinctUntilChanged<HospitalAdmin>((prev, curr) => {
                return prev.id === curr.id || prev.config.hospitalId.toHexString() === curr.config.hospitalId.toHexString();
            }))
            .subscribe(() => {
                this.gethospitaldetails();
            });
        /**
         * Fetch the hospital admins when the hosp changes
         */
        this.activehospital
            .pipe(
                skipWhile(t => !t._id),
                distinctUntilChanged<Hospital>((prev, curr) => {
                    return prev._id.toHexString() === curr._id.toHexString();
                }))
            .subscribe(() => {
                this.gethospitaladmins();
            });
    }

    gethospitaladmins(): void {
        this.stitch.db.collection<HospitalAdmin>('hospitaladmins')
            .find({ 'config.hospitalId': this.activehospital.value._id })
            .asArray()
            .then(hospitaladmindocs => {
                // console.log(hospitaladmindocs);
                this.hospitaladmins.next(hospitaladmindocs);
            });
    }


    savehospitalchanges(hospital: Hospital): Promise<any> {
        return this.stitch.db.collection('hospitals').findOneAndUpdate({ _id: hospital._id }, hospital);
    }

    adminexists(email: string): HospitalAdmin | undefined {
        return this.hospitaladmins.value.find(admin => {
            return admin.profile.email === email;
        });
    }


    gethospitaldetails(): void {
        /**
         * Remove any previous subscriptions before creating new ones
         */
        if (this.subscriptions.get('hospitaldetails')) {
            this.subscriptions.get('hospitaldetails').close();
        }
        this.stitch.db.collection<Hospital>('hospitals').findOne({ _id: this.adminservice.userdata.config.hospitalId })
            .then(async value => {
                this.activehospital.next(Object.assign({}, { ...emptyhospital }, value));
                /**
                 * ensnure that there's only one source of truth
                 */
                this.subscriptions.set('hospitaldetails',
                    await this.stitch.db.collection<Hospital>('hospitals')
                        .watch([this.adminservice.userdata.config.hospitalId]));
                this.subscriptions.get('hospitaldetails').onNext(data => {
                    this.activehospital.next(Object.assign({}, { ...emptyhospital }, data.fullDocument));
                });
            });
    }
}
