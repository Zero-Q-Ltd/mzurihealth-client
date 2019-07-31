import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { emptyadmin, HospitalAdmin } from '../../models/user/HospitalAdmin';
import { NotificationService } from '../../shared/services/notifications.service';
import { AdminCategory } from '../../models/user/AdminCategory';
import { AdminInvite } from '../../models/user/AdminInvite';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription } from 'apollo-client/util/Observable';
import { Patient } from 'app/models/patient/Patient';

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
    // We use the gql tag to parse our query string into a query document
    CurrentUserForProfile = gql`
mutation {
  createAdmin(input :  {email:  "tester@gmail.com"}){
    status
  }
}
    `;
    private querySubscription: Subscription;

    constructor(private router: Router,
        private notificationservice: NotificationService,
        private apollo: Apollo
    ) {
        console.log('sending query');

        this.apollo.mutate<Patient>({ mutation: this.CurrentUserForProfile })
            .subscribe(({ data, loading }) => {
                console.log(data);
            });
    }

    // The the status of the activeadmin
    setstatus(availability: number): void {
        const config = this.userdata.config;
        config.availability = availability;

    }

    getadmincategories(): void {
        // this.db.firestore.collection('admincategories').onSnapshot(allcategorydata => {
        //     this.admincategories.next(allcategorydata.docs.map(categorydata => {
        //         const category = categorydata.data() as AdminCategory;
        //         category._id = categorydata._id;
        //         return category;
        //     }));
        // });
    }

    disableadmin(adminid: string): any {
        // return this.db.firestore.collection('hospitaladmins').doc(adminid).update({status: false});
    }

    enableadmin(adminid: string): any {
        // return this.db.firestore.collection('hospitaladmins').doc(adminid).update({status: true});
    }

    deleteinvite(inviteid: string): any {
        // return this.db.firestore.collection('admininvites').doc(inviteid).delete();
    }

    signout(): void {
        // this.afAuth.auth.signOut();
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

    logout(): void {
        // this.afAuth.auth.signOut();
        this.router.navigate(['/admin/authentication/login']);
    }

    checkinvite(): void {
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
}
