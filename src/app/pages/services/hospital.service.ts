import { Injectable } from '@angular/core';
import { AdminService } from './admin.service';
import { BehaviorSubject } from 'rxjs';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { emptyhospital, Hospital } from '../../models/hospital/Hospital';
import { AdminInvite, emptyadmininvite } from '../../models/user/AdminInvite';
import { StitchService } from './stitch/stitch.service';
import { distinctUntilChanged } from 'rxjs/operators';
import * as equal from 'deep-equal';
import { Stream } from 'mongodb-stitch-core-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';

@Injectable({
    providedIn: 'root'
})
export class HospitalService {
    hospitaladmins: BehaviorSubject<HospitalAdmin[]> = new BehaviorSubject([]);
    activehospital: BehaviorSubject<Hospital> = new BehaviorSubject<Hospital>({ ...emptyhospital });
    userdata: HospitalAdmin;
    hospitalerror: boolean;
    invitedadmins: BehaviorSubject<Array<AdminInvite>> = new BehaviorSubject<Array<AdminInvite>>([]);

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
        adminservice.observableuserdata.pipe(distinctUntilChanged((prev, curr) =>
            equal(prev._id, curr._id) || equal(prev.config.hospitalId, curr.config.hospitalId)))
            .subscribe((admin: HospitalAdmin) => {
                if (admin._id) {
                    this.userdata = admin;
                    this.gethospitaldetails();
                }
            });
    }

    gethospitaladmins(): void {
        this.stitch.db.collection<HospitalAdmin>('hospitaladmins')
            .find({ 'config.hospitalid': this.activehospital.value._id })
            .asArray()
            .then(hospitaladmindocs => {
                this.hospitaladmins.next(hospitaladmindocs);
            });
    }

    getinvitedadmins(): void {
        this.stitch.db.collection<AdminInvite>('admininvites')
            .find({ 'hospitalId': this.activehospital.value._id })
            .toArray()
            .then(invitesdata => {
                /**
                 * This step is just t make sure that all the data is standardized in case there are any missing attributes
                 * from a previous version
                 */
                this.invitedadmins.next(invitesdata.map(inviteedata => {
                    return Object.assign({}, { ...emptyadmininvite }, inviteedata);
                }));
            });
    }

    savehospitalchanges(hospital: Hospital): Promise<any> {
        return this.stitch.db.collection('hospitals').findOneAndUpdate({ _id: hospital._id }, hospital);
    }

    adminexists(email: string): HospitalAdmin | undefined {
        return this.hospitaladmins.value.find(admin => {
            return admin.data.email === email;
        });
    }


    gethospitaldetails(): void {
        /**
         * Remove any previous subscriptions before creating new ones
         */
        if (this.subscriptions.get('hospitaldetails')) {
            this.subscriptions.get('hospitaldetails').close()
        }
        this.stitch.db.collection<Hospital>('hospitals').findOne({ _id: this.userdata.config.hospitalId })
            .then(async value => {
                this.activehospital.next(Object.assign({}, { ...emptyhospital }, value));
                /**
                 * ensnure that there's only one source of truth
                 */
                this.subscriptions.set('hospitaldetails', await this.stitch.db.collection<Hospital>('hospitals').watch([this.userdata.config.hospitalId]))
                this.subscriptions.get('hospitaldetails').onNext(data => {
                    this.activehospital.next(Object.assign({}, { ...emptyhospital }, data.fullDocument));
                });
            });
    }
}
