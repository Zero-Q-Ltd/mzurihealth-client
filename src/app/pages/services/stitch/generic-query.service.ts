import { Injectable } from '@angular/core';
import { BSON, RemoteMongoCollection, Stream } from 'mongodb-stitch-browser-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';
import { ReplaySubject } from 'rxjs';
import { StitchService } from './stitch.service';

@Injectable({
  providedIn: 'root'
})
export class GenericQueryService {
  /**
      * This keeps a list of all the DATABASE SUBSCRIPTIONS that have been made by this service
      * It's to be maintined as a standard across all services
      */
  dbSubscriptions: Map<string | BSON.ObjectId, Stream<ChangeEvent<any>>> = new Map();
  constructor(
    private stitch: StitchService) {

  }

  async watchId<T>(id: BSON.ObjectId, collectionName: RemoteMongoCollection<T>): Promise<ReplaySubject<T>> {
    const query = {
      _id: id
    };
    const queryid = new BSON.ObjectId();

    const response: ReplaySubject<T> = new ReplaySubject(1);
    const collection = this.stitch.db.collection<T>('patients');
    this.dbSubscriptions.set(queryid.toString(), await collection.watch([id]));
    collection.findOne(query)
      .then(async value => {
        response.next(value);
      })
      .catch(e => response.error(e));

    this.dbSubscriptions.get(queryid.toString()).onNext(data => {
      response.next(data.fullDocument);
    });
    this.dbSubscriptions.get(queryid.toString()).onError(e => {
      response.error(e);
    });
    return response;
  }


  async watchIds<T>(Ids: BSON.ObjectId[], collectionName: RemoteMongoCollection<T>): Promise<ReplaySubject<T[]>> {
    const query = {
      _id: { $in: Ids }
    };
    const queryid = new BSON.ObjectId();

    const response: ReplaySubject<T[]> = new ReplaySubject(1);
    const collection = this.stitch.db.collection<T>('patients');
    this.dbSubscriptions.set(queryid.toString(), await collection.watch(Ids));

    collection.find(query)
      .toArray()
      .then(async value => {
        response.next(value);
      })
      .catch(e => response.error(e));

    this.dbSubscriptions.get(queryid.toString()).onNext(data => {
      response.next(data.fullDocument);
    });
    this.dbSubscriptions.get(queryid.toString()).onError(e => {
      response.error(e);
    });
    return response;
  }


}
