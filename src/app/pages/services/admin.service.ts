import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { NotificationService } from '../../shared/services/notifications.service';
import { AdminCategory } from '../../models/user/AdminCategory';
import { AdminInvite } from '../../models/user/AdminInvite';
import { StitchService } from './stitch/stitch.service';
import { StitchUser, Stream, } from 'mongodb-stitch-browser-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';
import * as BSON from 'bson';
import { CoreService } from './core/core.service';
@Injectable({
    providedIn: 'root'
})
export class AdminService {


    constructor(private router: Router,
        private notificationservice: NotificationService,
        private core: CoreService,
        private stitch: StitchService) {

    }

    // The the status of the activeadmin
    setstatus(availability: number): void {
        // const config = this.userdata.config;
        // config.availability = availability;
    }



    disableadmin(adminid: string): Promise<any> {
        return this.stitch.db.collection('hospitaladmins').updateOne({ id: adminid }, { status: false });
        // return this.db.firestore.collection('hospitaladmins').doc(adminid).update({status: false});
    }

    enableadmin(adminid: string): Promise<any> {
        return this.stitch.db.collection('hospitaladmins').updateOne({ id: adminid }, { status: false });
        // return this.db.firestore.collection('hospitaladmins').doc(adminid).update({status: true});
    }

    deleteinvite(inviteid: BSON.ObjectID): Promise<any> {
        return this.stitch.db.collection('admininvites').deleteOne({ _id: inviteid });

        // return this.db.firestore.collection('admininvites').doc(inviteid).delete();
    }

    initusertypes(): void {
        // admincategorydata.admincategories.forEach(async (category: AdminCategory) => {
        //     const batch = this.db.firestore.batch();
        //     category.name = category.name.toLowerCase();
        //     if (category.subcategories) {
        //         Object.keys(category.subcategories).forEach(key => {
        //             category.subcategories[key].name = category.subcategories[key].name.toLowerCase();
        //             category.subcategories[key].description = category.subcategories[key].description.toLowerCase();
        //         });
        //     }
        //     batch.set(this.db.firestore.collection('admincategories').doc(this.db.createId()), category);
        //     return await batch.commit();
        // });
    }


    createinvite(userdata: AdminInvite): any {
        // return this.afAuth.auth.sendSignInLinkToEmail(userdata.email, {
        //     handleCodeInApp: true,
        //     url: 'https://mzurihealth.firebaseapp.com/admin/authentication/signin',
        // }).then(() => {
        //     this.db.firestore.collection('admininvites').add(userdata);
        // });

    }
}
