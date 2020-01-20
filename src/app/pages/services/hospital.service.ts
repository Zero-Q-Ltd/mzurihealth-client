import { Injectable } from '@angular/core';
import * as BSON from 'bson';
import { Stream } from 'mongodb-stitch-core-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';
import { emptyhospital, Hospital } from '../../models/hospital/Hospital';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { CoreService } from './core/core.service';
import { StitchService } from './stitch/stitch.service';

@Injectable({
    providedIn: 'root'
})
export class HospitalService {
    /**
     * This keeps a list of all the subscriptions TO THE DATABASE that have been made by this service
     * It's to be maintined as a standard across all services
     */
    hospitalCollection = this.stitch.db.collection('hospitals');
    subscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();
    constructor(private core: CoreService,
        private stitch: StitchService) {

    }



    savehospitalchanges(hospital: Hospital): Promise<any> {
        return this.hospitalCollection.findOneAndUpdate({ _id: hospital._id }, hospital);
    }

}
