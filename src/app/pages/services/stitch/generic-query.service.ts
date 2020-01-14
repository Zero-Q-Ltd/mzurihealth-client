import { Injectable } from '@angular/core';
import { BaseMongoObject } from 'app/models/universal';
import { BSON, RemoteMongoCollection, Stream } from 'mongodb-stitch-browser-sdk';
import { ChangeEvent, OperationType } from 'mongodb-stitch-core-services-mongodb-remote';
import { ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';
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


  async watchCollection<T extends BaseMongoObject>(dataArray: T[], collection: RemoteMongoCollection<T>): Promise<ReplaySubject<T[]>> {
    const queryid = new BSON.ObjectId();
    const response: ReplaySubject<T[]> = new ReplaySubject(1);
    this.dbSubscriptions.set(queryid.toString(), await collection.watch());

    this.dbSubscriptions.get(queryid.toString()).onNext(data => {
      switch (data.operationType) {
        case OperationType.Delete: {
          /**
           * remove the deleted element from the array by filtering and only returning true if the id matches
           */
          response.next(dataArray.filter(t => {
            return t._id.toHexString() !== data.fullDocument._id;
          }));
          break;
        }
        case OperationType.Insert: {
          /**
           * Add the element to the array
           */
          dataArray.push(data.fullDocument);
          response.next(dataArray);
          break;
        }

        case OperationType.Replace: {
          /**
           * replace the edited element in the array and return whole array
           */
          response.next(dataArray.map(t => {
            if (t._id.toHexString() !== data.fullDocument._id) {
              t = data.fullDocument;
            } else {
              return t;
            }
          }));
          break;
        }

        case OperationType.Update: {
          /**
           * replace the edited element in the array and return whole array
           */
          response.next(dataArray.map(t => {
            if (t._id.toHexString() !== data.fullDocument._id) {
              t = data.fullDocument;
            } else {
              return t;
            }
          }));
          break;
        }

        default: {
          response.error('An unknown db operation occured');
          break;
        }
      }
    });
    this.dbSubscriptions.get(queryid.toString()).onError(e => {
      response.error(e);
    });
    return response;
  }


}
