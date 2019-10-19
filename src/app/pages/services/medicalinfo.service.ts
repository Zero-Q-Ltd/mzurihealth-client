import { Injectable } from '@angular/core';
import { StitchService } from './stitch/stitch.service';
import { MedicalInfo, emptymedicalInfo } from 'app/models/patient/MedicalInfo';
import { BSON, Stream } from 'mongodb-stitch-core-sdk';
import { Observable, Subscription, BehaviorSubject, Subject, ReplaySubject } from 'rxjs';
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
  async watchLatest(patientid: BSON.ObjectId): Promise<ReplaySubject<MedicalInfo>> {
    const query = {
      patientId: patientid
    };
    const queryid = + new Date();

    const response: ReplaySubject<MedicalInfo> = new ReplaySubject(1);
    const collection = this.stitch.db.collection<MedicalInfo>('medinfo');
    this.dbSubscriptions.set(queryid, await collection.watch([patientid]));
    await collection.findOne(query)
      .then(async value => {
        if (!value) {
          response.error('No Doc found');
        }
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
  updateMedInfo(id: BSON.ObjectId, newData: MedicalInfo) {
    const query = {
      _id: id
    };
    return this.stitch.db.collection<MedicalInfo>('medinfo').updateOne(query, newData);
  }
}
