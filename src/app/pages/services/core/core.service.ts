import { Injectable } from '@angular/core';
import { StitchService } from '../stitch/stitch.service';
import { ReplaySubject, BehaviorSubject } from 'rxjs';
import { HospitalAdmin } from 'app/models/user/HospitalAdmin';
import { AdminCategory } from 'app/models/user/AdminCategory';
import { StitchUser, Stream } from 'mongodb-stitch-browser-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';

@Injectable({
  providedIn: 'root'
})
export class CoreService {
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
   * This keeps a list of all the subscriptions TO THE DATABASE that have been made by this service
   * It's to be maintined as a standard across all services
   */
  subscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();

  constructor(
    private stitch: StitchService,
  ) {
    this.stitch.user.subscribe(value => {
      this.getuser(value);
      console.log(value);
    });
    this.observableuserdata.subscribe(value => {
      this.userdata = value;
    });
  }
  getuser = async (user: StitchUser) => {
    console.log('Fetching User data');
    this.stitch.db.collection<HospitalAdmin>('hospitaladmins')
      .findOne({ id: user.id })
      .then(async userdata => {
        this.observableuserdata.next({ ...user, ...userdata });

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
