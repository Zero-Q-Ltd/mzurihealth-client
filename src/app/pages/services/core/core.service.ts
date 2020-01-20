import {Injectable} from '@angular/core';
import {StitchService} from '../stitch/stitch.service';
import {BehaviorSubject, ReplaySubject} from 'rxjs';
import {HospitalAdmin} from 'app/models/user/HospitalAdmin';
import {AdminCategory} from 'app/models/user/AdminCategory';
import {StitchUser, Stream} from 'mongodb-stitch-browser-sdk';
import {ChangeEvent} from 'mongodb-stitch-core-services-mongodb-remote';
import {emptyhospital, Hospital} from 'app/models/hospital/Hospital';
import {distinctUntilChanged, skipWhile} from 'rxjs/operators';
import * as BSON from 'bson';
import {HospitalService} from '../hospital.service';
import {CurrentPatient, MergedPatientQueueModel} from 'app/models/visit/MergedPatientQueueModel';
import {Visit} from 'app/models/visit/Visit';
import {PaymentChannel, Paymentmethods} from 'app/models/payment/PaymentChannel';
import {PaymentmethodService} from '../paymentmethod.service';
import {AdminService} from '../admin.service';

@Injectable({
    providedIn: 'root'
})
export class CoreService {
    hospitaladmins: BehaviorSubject<HospitalAdmin[]> = new BehaviorSubject([]);
    activehospital: BehaviorSubject<Hospital> = new BehaviorSubject<Hospital>({...emptyhospital});
    hospitalerror: boolean;
    /**
     * The only source of truth
     */
    observableuserdata: ReplaySubject<HospitalAdmin> = new ReplaySubject(1);
    /**
     * Secondary copy of data to avoid many unnecessary subscriptions
     */
    userdata: HospitalAdmin;
    admincategories: BehaviorSubject<Array<AdminCategory>> = new BehaviorSubject<Array<AdminCategory>>([]);
    /**
     * by using a map instead of a normal array we solve the n+1 problem that we would have
     * otherwise encountered when sifting through the data, as there is a lot of fitering to do
     * and for big hospitals the number of patients in the mainqueue at any given time might be big
     */
    mainpatientsqueue: BehaviorSubject<Map<string, MergedPatientQueueModel>> = new BehaviorSubject(new Map());
    mypatientqueue: BehaviorSubject<Map<string, MergedPatientQueueModel>> = new BehaviorSubject(new Map());

    currentpatient: BehaviorSubject<CurrentPatient> = new BehaviorSubject(null);
    currentpatientHistory: BehaviorSubject<Array<Visit>> = new BehaviorSubject<Array<Visit>>([]);

    adminid: string;
    fetchingpatientdata: BehaviorSubject<boolean> = new BehaviorSubject(false);
    fetchingCurrentpatientdata: BehaviorSubject<boolean> = new BehaviorSubject(false);
    /**
     * This keeps a list of all the subscriptions TO THE DATABASE that have been made by this service
     * It's to be maintined as a standard across all services
     */
    subscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();

    allpaymentchannels: BehaviorSubject<Array<PaymentChannel>> = new BehaviorSubject<Array<PaymentChannel>>([]);
    allinsurance: BehaviorSubject<{ [key: string]: Paymentmethods }> = new BehaviorSubject({});

    constructor(
        private stitch: StitchService,
        private hospitalService: HospitalService,
        private adminService: AdminService,
        private paymentsService: PaymentmethodService
    ) {
        this.stitch.user.pipe(
            skipWhile(t => !t.id),
            distinctUntilChanged<HospitalAdmin>((prev, curr) => {
                return prev.id === curr.id || prev.config.hospitalId.toHexString() === curr.config.hospitalId.toHexString();
            }))
            .subscribe(value => {
                this.getuser(value);
                this.gethospitalDetails(value.config.hospitalId);
                this.adminService.gethospitalAdmins(value.config.hospitalId).then(res => {
                    this.hospitaladmins.next(res);
                });
                console.log(value);
            });
        this.observableuserdata.subscribe(value => {
            this.userdata = value;
        });
    }

    getuser = async (user: StitchUser) => {
        console.log('Fetching User data');
        this.stitch.db.collection<HospitalAdmin>('hospitaladmins')
            .findOne({id: user.id})
            .then(async userdata => {
                this.observableuserdata.next({...user, ...userdata});

                console.log('User data fetched');
                const stream = await this.stitch.db.collection<HospitalAdmin>('hospitaladmins')
                    .watch([user.id]);
                stream.onNext(data => {
                    console.log(data.fullDocument);
                    this.observableuserdata.next(data.fullDocument);
                });
                stream.onError(error => {
                    console.log(error);
                });
            });
    };

    adminexists(email: string): HospitalAdmin | undefined {
        return this.hospitaladmins.value.find(admin => {
            return admin.profile.email === email;
        });
    }

    gethospitalDetails(hospitalId: BSON.ObjectId): void {
        /**
         * Remove any previous subscriptions before creating new ones
         */
        if (this.subscriptions.get('hospitaldetails')) {
            this.subscriptions.get('hospitaldetails').close();
        }
        this.hospitalService.hospitalCollection.findOne({_id: hospitalId})
            .then(async value => {
                this.activehospital.next(Object.assign({}, {...emptyhospital}, value));
                /**
                 * ensnure that there's only one source of truth
                 */
                this.subscriptions.set('hospitaldetails',
                    await this.hospitalService.hospitalCollection
                        .watch([hospitalId]));
                this.subscriptions.get('hospitaldetails').onNext(data => {
                    this.activehospital.next(Object.assign({}, {...emptyhospital}, data.fullDocument));
                });
            });
    }

    getallpaymentchannels(): void {
        this.paymentsService.paymentChannelsCollection
            .find({})
            .toArray()
            .then(channels => {
                let insurancecompanies = {};
                this.allpaymentchannels.next(channels.map(channel => {
                    if (channel.name === 'insurance') {
                        insurancecompanies = channel.methods;
                    }
                    return channel;
                }));
                this.allinsurance.next(insurancecompanies);
            });
    }

    getadmincategories(): void {
        this.stitch.db.collection<AdminCategory>('admincategories')
            .find()
            .asArray()
            .then(values => {
                this.admincategories.next(values);
            });
    }

    unsubscribeAll(): void {
        this.subscriptions.forEach(value => {
            value.close();
        });
    }
}
