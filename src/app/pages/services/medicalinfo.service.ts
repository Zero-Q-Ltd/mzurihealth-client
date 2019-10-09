import { Injectable } from '@angular/core';
import { StitchService } from './stitch/stitch.service';
import { MedicalInfo, emptymedicalInfo } from 'app/models/patient/MedicalInfo';
import { BSON, Stream } from 'mongodb-stitch-core-sdk';
import { Observable, Subscription, BehaviorSubject, Subject } from 'rxjs';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';

@Injectable({
  providedIn: 'root'
})
export class MedicalinfoService {

  /**
   * This keeps a list of all the DATABASE SUBSCRIPTIONS that have been made by this service
   * It's to be maintined as a standard across all services
   */
  dbSubscriptions: Map<BSON.ObjectId, Stream<ChangeEvent<any>>> = new Map();
  /**
   * This keeps a copy of all the internal subscriptions to INTERNAL OBSERVABLES
   * It's to be maintined as a standard across all services
   */
  internalSubscriptions: Map<string, Subscription> = new Map();

  constructor(
    private stitch: StitchService) {
  }
  
  /**
   * @TODO Medical info changes with thime
   * Figure out a way of fetching only the most recent object
   */
  async watchLatest(patientid: BSON.ObjectId): Promise<Subject<MedicalInfo>> {
    const query = {
      _id: patientid
    };
    const queryid = + new Date();
    const response: Subject<MedicalInfo> = new Subject()
    this.dbSubscriptions.set(queryid, await this.stitch.db.collection<MedicalInfo>('medinfo').watch(query));
    this.stitch.db.collection<MedicalInfo>('medinfo').findOne(query)
      .then(async value => {
        response.next(value);
      })
      .catch(e => response.error(e));

    this.dbSubscriptions.get(queryid).onNext(data => {
      response.next(data.fullDocument);
    });
    this.dbSubscriptions.get(queryid).onError(e => {
      response.error(e);
    });
    return response;

  }
}
