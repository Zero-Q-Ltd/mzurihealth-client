import {Injectable} from '@angular/core';
import {AdminService} from './admin.service';
import {BehaviorSubject} from 'rxjs';
import {HospitalAdmin} from '../../models/user/HospitalAdmin';
import {emptyhospital, Hospital} from '../../models/hospital/Hospital';
import {AdminInvite, emptyadmininvite} from '../../models/user/AdminInvite';

@Injectable({
    providedIn: 'root'
})
export class HospitalService {
    hospitaladmins: BehaviorSubject<HospitalAdmin[]> = new BehaviorSubject([]);
    activehospital: BehaviorSubject<Hospital> = new BehaviorSubject<Hospital>({...emptyhospital});
    userdata: HospitalAdmin;
    hospitalerror: boolean;
    invitedadmins: BehaviorSubject<Array<AdminInvite>> = new BehaviorSubject<Array<AdminInvite>>([]);

    constructor(private adminservice: AdminService) {
        adminservice.observableuserdata.subscribe((admin: HospitalAdmin) => {
            if (admin._id) {
                console.log(admin.config.hospitalId);
                this.userdata = admin;
                this.gethospitaldetails();
            }
        });

    }

    gethospitaladmins(): void {
        // this.stitch.db.collection('hospitaladmins')
        //     .find({'config.hospitalid': this.activehospital.value._id});
        // .onSnapshot(hospitaladmindocs => {
        //     this.hospitaladmins.next(hospitaladmindocs.docs.map(hospitaladmin => {
        //         return Object.assign(hospitaladmin.data() as HospitalAdmin, {_id: hospitaladmin._id});
        //     }));
        // });
    }

    getinvitedadmins(): void {
        // this.stitch.db.collection('admininvites').where('hospitalId', '==', this.activehospital.value._id).onSnapshot(invitesdata => {
        //     this.invitedadmins.next(invitesdata.docs.map(inviteedata => {
        //         return Object.assign(emptyadmininvite, inviteedata.data() as AdminInvite, {_id: inviteedata._id});
        //     }));
        // });
    }

    savehospitalchanges(hospital: Hospital): Promise<{}> {
        return true as any;
        // return this.stitch.db.collection('hospitals').findOneAndUpdate({_id: hospital._id}, hospital);
    }

    adminexists(email: string): HospitalAdmin | undefined {
        return this.hospitaladmins.value.find(admin => {
            return admin.data.email === email;
        });
    }


    gethospitaldetails(): void {
        return true as any;
        // this.stitch.db.collection<Hospital>('hospitals').findOne({_id: this.userdata.config.hospitalId})
        //     .then(async value => {
        //         console.log(value);
        //         this.activehospital.next(Object.assign(emptyhospital, value));
        //         let changes = await this.stitch.db.collection<Hospital>('hospitals').watch([this.userdata.config.hospitalId]);
        //         changes.onNext(data => {
        //             this.activehospital.next(Object.assign(emptyhospital, data));
        //         });
        //     });
    }
}
