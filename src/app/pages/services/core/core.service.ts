import { Injectable } from '@angular/core';
import { StitchService } from '../stitch/stitch.service';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { HospitalAdmin } from 'app/models/user/HospitalAdmin';
import { AdminCategory } from 'app/models/user/AdminCategory';
import { StitchUser, Stream, RemoteFindOptions } from 'mongodb-stitch-browser-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';
import { emptyhospital, Hospital } from 'app/models/hospital/Hospital';
import { distinctUntilChanged, skipWhile } from 'rxjs/operators';
import * as BSON from 'bson';
import { HospitalService } from '../hospital.service';
import { CurrentPatient, MergedPatientQueueModel } from 'app/models/visit/MergedPatientQueueModel';
import { Visit } from 'app/models/visit/Visit';
import { PaymentChannel, Paymentmethods } from 'app/models/payment/PaymentChannel';
import { PaymentmethodService } from '../paymentmethod.service';
import { AdminService } from '../admin.service';
import { Patientnote } from 'app/models/patient/Patientnote';
import { PatientnotesService } from '../patientnotes.service';
import { MergedProcedureModel } from 'app/models/procedure/MergedProcedure.model';
import { CustomProcedureConfig } from 'app/models/procedure/CustomProcedure';
import { ProcedureCategory } from 'app/models/procedure/ProcedureCategory';
import { ProceduresService } from '../procedures.service';

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  hospitaladmins: BehaviorSubject<HospitalAdmin[]> = new BehaviorSubject([]);
  activeHospital: BehaviorSubject<Hospital> = new BehaviorSubject<Hospital>({ ...emptyhospital });
  activeHospitalId: BSON.ObjectID;
  hospitalError: boolean;
  /**
   * The only source of truth
   */
  observableUserData: ReplaySubject<HospitalAdmin> = new ReplaySubject(1);
  /**
   * Secondary copy of data to avoid many unnecessary subscriptions
   */
  userData: HospitalAdmin;
  adminCategories: BehaviorSubject<Array<AdminCategory>> = new BehaviorSubject<Array<AdminCategory>>([]);
  /**
   * by using a map instead of a normal array we solve the n+1 problem that we would have
   * otherwise encountered when sifting through the data, as there is a lot of fitering to do
   * and for big hospitals the number of patients in the mainqueue at any given time might be big
   */
  mainPatientsQueue: BehaviorSubject<Map<string, MergedPatientQueueModel>> = new BehaviorSubject(new Map());
  myPatientQueue: BehaviorSubject<Map<string, MergedPatientQueueModel>> = new BehaviorSubject(new Map());

  currentPatient: BehaviorSubject<CurrentPatient> = new BehaviorSubject(null);
  currentPatientHistory: BehaviorSubject<Array<Visit>> = new BehaviorSubject<Array<Visit>>([]);

  adminId: string;
  fetchingPatientData: BehaviorSubject<boolean> = new BehaviorSubject(false);
  fetchingCurrentPatientdata: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /**
   * This keeps a list of all the subscriptions TO THE DATABASE that have been made by this service
   * It's to be maintined as a standard across all services
   */
  subscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();

  allpaymentchannels: BehaviorSubject<Array<PaymentChannel>> = new BehaviorSubject<Array<PaymentChannel>>([]);
  allinsurance: BehaviorSubject<{ [key: string]: Paymentmethods }> = new BehaviorSubject({});

  hospitalprocedures: BehaviorSubject<Map<string, MergedProcedureModel>> = new BehaviorSubject(new Map());
  hospitalCustomProcedureConfig !: CustomProcedureConfig;
  activehospital: Hospital;
  categories: BehaviorSubject<Array<ProcedureCategory>> = new BehaviorSubject<Array<ProcedureCategory>>([]);

  constructor(
    private stitch: StitchService,
    private hospitalService: HospitalService,
    private adminService: AdminService,
    private paymentsService: PaymentmethodService,
    private patientNotes: PatientnotesService,
    private procedures: ProceduresService
  ) {
    this.stitch.user.pipe(
      skipWhile(t => !t.id),
      distinctUntilChanged<HospitalAdmin>((prev, curr) => {
        return prev.id === curr.id || prev.config.hospitalId.toHexString() === curr.config.hospitalId.toHexString();
      }))
      .subscribe(value => {
        this.getuser(value);

      });
    this.observableUserData.subscribe(value => {
      this.userData = value;
      this.gethospitalDetails(value.config.hospitalId);
      this.adminService.gethospitalAdmins(value.config.hospitalId).then(res => {
        this.hospitaladmins.next(res);
      });
      console.log(value);
    });

    this.currentPatient.subscribe(value => {
      if (value) {
        this.fetchpatientnotes(value.patientdata._id);
      }
    });
  }

  getuser = async (user: StitchUser) => {
    console.log('Fetching User data');
    this.stitch.db.collection<HospitalAdmin>('hospitaladmins')
      .findOne({ id: user.id })
      .then(async userdata => {
        this.observableUserData.next({ ...user, ...userdata });

        console.log('User data fetched');
        const stream = await this.stitch.db.collection<HospitalAdmin>('hospitaladmins')
          .watch([user.id]);
        stream.onNext(data => {
          console.log(data.fullDocument);
          this.observableUserData.next(data.fullDocument);
        });
        stream.onError(error => {
          console.log(error);
        });
      });
  }

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
    this.hospitalService.hospitalCollection.findOne({ _id: hospitalId })
      .then(async value => {
        this.activeHospital.next(Object.assign({}, { ...emptyhospital }, value));
        this.activeHospitalId = value._id;
        /**
         * ensnure that there's only one source of truth
         */
        this.getprocedures();
        this.getprocedurecategories();


        this.subscriptions.set('hospitaldetails',
          await this.hospitalService.hospitalCollection
            .watch([hospitalId]));
        this.subscriptions.get('hospitaldetails').onNext(data => {
          this.activeHospital.next(Object.assign({}, { ...emptyhospital }, data.fullDocument));
        });
      });
  }
  getprocedurecategories(): void {
    const query = {};
    const options = {
      sort: {
        name: 1
      }
    };


    this.procedures.procedureCategoriesCollection.find(query, options)
      .toArray()
      .then(values => {
        this.categories.next(values);
        /**
         * in case we ever need to ut all the procedures in the database
         * or the categories, this is the right place
         */
        // this.syncprocedures();
      })
      ;
  }

  getprocedures(): void {
    /**
     * I honestly am not sure why the following code works so well
     * Please.... be very careful before changing
     */
    const query = {
      hospitalId: this.activeHospitalId
    };
    const options = {};

    this.procedures.procedureConfigsCollection
      .findOne(query, options)
      .then(data => {
        if (!data) {
          return;
        }
        this.hospitalCustomProcedureConfig = data;
        const mapData = new Map<string, MergedProcedureModel>();
        data.procedures.map(procedure => {
          /**
           * only fetch proceures that are active
           */
          if (!procedure.status) {
            return;
          }
          mapData.set(procedure.parentId.toString(), { customProcedure: procedure, rawProcedure: null });
        });

        const innerquery = {
          _id: {
            $in: Array.from(mapData
              .values())
              .map(val => {
                return val.customProcedure.parentId;
              })
          }
        };

        const inneroptions = {};

        this.procedures.proceduresCollection.find(innerquery, inneroptions)
          .toArray()
          .then(originalprocedures => {
            originalprocedures.map(original => {
              const match = mapData.get(original._id.toString());
              mapData.set(original._id.toString(), { customProcedure: match.customProcedure, rawProcedure: original });
            });
            this.hospitalprocedures.next(mapData);
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
        this.adminCategories.next(values);
      });
  }

  fetchpatientnotes(patientId: BSON.ObjectId): Promise<Patientnote[]> {
    const query = {
      patientId: patientId
    };
    const options: RemoteFindOptions = {
      limit: 100,
      sort: {
        'metadata.date': 1
      }
    };
    return this.patientNotes.patientNotesCollection
      .find(query, options)
      .toArray();
  }
  unsubscribeAll(): void {
    this.subscriptions.forEach(value => {
      value.close();
    });
  }
}
