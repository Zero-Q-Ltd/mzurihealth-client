import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { emptyadmin, HospitalAdmin } from '../../models/user/HospitalAdmin';
import { NotificationService } from '../../shared/services/notifications.service';
import { AdminCategory } from '../../models/user/AdminCategory';
import { AdminInvite } from '../../models/user/AdminInvite';
import { StitchService } from './stitch/stitch.service';
import { BSON, StitchUser, Stream, } from 'mongodb-stitch-browser-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';

@Injectable({
    providedIn: 'root'
})
export class AdminService {

    /**
     * The only source of truth
     */
    observableuserdata: ReplaySubject<HospitalAdmin> = new ReplaySubject(1);
    /**
     * Secondary copy of data to avoid many unnecessary subscriptions
     */
    userdata: HospitalAdmin = emptyadmin;
    activeurl: string = null;
    firstlogin = false;
    validuser: boolean;
    admincategories: BehaviorSubject<Array<AdminCategory>> = new BehaviorSubject<Array<AdminCategory>>([]);

    /**
     * This keeps a list of all the subscriptions TO THE DATABASE that have been made by this service
     * It's to be maintined as a standard across all services
     */
    subscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();

    constructor(private router: Router,
        private notificationservice: NotificationService,
        private stitch: StitchService) {
        this.stitch.user.subscribe(value => {
            this.getuser(value);
        });
        this.observableuserdata.subscribe(value => {
            this.userdata = value;
        });
        this.stitch.client.callFunction("searchpatient", ["test"]).then(f => {
            console.log(f)
        })

    }

    // The the status of the activeadmin
    setstatus(availability: number): void {
        const config = this.userdata.config;
        config.availability = availability;
    }

    getuser = async (user: StitchUser) => {
        this.stitch.db.collection<HospitalAdmin>('hospitaladmins')
            .findOne({ _id: new BSON.ObjectId(user.id) })
            .then(async userdata => {
                this.observableuserdata.next(userdata);
                console.log(userdata);
                const stream = await this.stitch.db.collection<HospitalAdmin>('hospitaladmins')
                    .watch([new BSON.ObjectId(user.id)]);
                stream.onNext(data => {
                    console.log(data.fullDocument);
                    this.observableuserdata.next(data.fullDocument);
                });
                stream.onError(error => {
                    console.log(error);
                });
            });
    };

    getadmincategories(): void {
        this.stitch.db.collection<AdminCategory>('admincategories')
            .find()
            .asArray()
            .then(values => {
                this.admincategories.next(values);
            });
    }

    disableadmin(adminid: BSON.ObjectId): Promise<any> {
        return this.stitch.db.collection('hospitaladmins').findOneAndUpdate({ _id: adminid }, { status: false });
        // return this.db.firestore.collection('hospitaladmins').doc(adminid).update({status: false});
    }

    enableadmin(adminid: BSON.ObjectId): Promise<any> {
        return this.stitch.db.collection('hospitaladmins').findOneAndUpdate({ _id: adminid }, { status: false });
        // return this.db.firestore.collection('hospitaladmins').doc(adminid).update({status: true});
    }

    deleteinvite(inviteid: BSON.ObjectId): Promise<any> {
        return this.stitch.db.collection('admininvites').findOneAndDelete({ _id: inviteid });

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

    checkinvite(user: StitchUser): void {
        // const invitequery = this.db.firestore.collection('admininvites')
        // .where('email', '==', user.email)
        // .limit(1)
        // .get().then(snapshot => {
        //     if (!snapshot.empty) {
        //         const invite = snapshot.docs[0].data() as AdminInvite;
        //         const newadmin: HospitalAdmin = {
        //             _id: user.uid,
        //             data: {
        //                 displayName: user.displayName,
        //                 email: user.email,
        //                 photoURL: user.photoURL,
        //                 uid: user.uid
        //             },
        //             profileData: {
        //                 phone: '',
        //                 address: '',
        //                 age: '',
        //                 bio: '',
        //                 status: null
        //             },
        //             config: {
        //                 level: invite.level,
        //                 categoryId: invite.categoyId,
        //                 availability: 1,
        //                 hospitalId: invite.hospitalId
        //             },
        //             status: true,
        //             metadata: {
        //                 date: firestore.Timestamp.now(),
        //                 lastEdit: firestore.Timestamp.now()
        //             }
        //         };
        //         this.db.firestore.collection(`hospitaladmins`).doc(user.uid).set(newadmin).then(result => {
        //             this.db.firestore.collection(`admininvites`).doc(snapshot.docs[0]._id).delete();
        //             if (this.activeurl === '/authentication/signin') {
        //                 this.router.navigate(['/dashboard']);
        //             }
        //         });
        //     } else {
        //         // console.log('User does not exist!!')
        //         this.notificationservice.notify({
        //             alertType: 'error',
        //             body: 'You have not registered with any Hospital. Please contactperson us for instrustions',
        //             title: 'ERROR', duration: 10000,
        //             icon: '',
        //             placement: {
        //                 vertical: 'top',
        //                 horizontal: 'center'
        //             }
        //         });
        //     }
        // }, error => {
        //     console.log('Error verifying invite');
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

    unsubscribeAll(): void {
        this.subscriptions.forEach(value => {
            value.close();
        });
    }
}
