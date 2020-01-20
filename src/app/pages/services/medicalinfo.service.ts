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
  medInfoCOllection = this.stitch.db.collection<MedicalInfo>('medinfo');
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
    return this.medInfoCOllection.findOne(query);
  }

  updateMedInfo(newData: MedicalInfo): Promise<RemoteUpdateResult> {
    return this.medInfoCOllection.updateOne(newData._id, newData);
  }
}
