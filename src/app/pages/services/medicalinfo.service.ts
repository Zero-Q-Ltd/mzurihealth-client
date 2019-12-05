import { Injectable } from '@angular/core';
import { StitchService } from './stitch/stitch.service';
import { MedicalInfo, emptymedicalInfo } from 'app/models/patient/MedicalInfo';
import { Stream } from 'mongodb-stitch-core-sdk';
import { Observable, Subscription, BehaviorSubject, Subject, ReplaySubject } from 'rxjs';
import { ChangeEvent, RemoteUpdateResult } from 'mongodb-stitch-core-services-mongodb-remote';
import * as BSON from 'bson';

@Injectable({
  providedIn: 'root'
})
export class MedicalinfoService {

  /**
   * This keeps a list of all the DATABASE SUBSCRIPTIONS that have been made by this service
   * It's to be maintined as a standard across all services
   */
  dbSubscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();
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
  getLatest(patientId: BSON.ObjectId): Promise<MedicalInfo> {
    const query = {
      patientId
    };
    return this.stitch.db.collection<MedicalInfo>('medinfo').findOne(query);
  }

  updateMedInfo(newData: MedicalInfo): Promise<RemoteUpdateResult> {
    return this.stitch.db.collection<MedicalInfo>('medinfo').updateOne(newData._id, newData);
  }
}
