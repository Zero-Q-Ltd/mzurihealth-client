import {emptypatient, Patient} from '../patient/Patient';
import {emptypatientvisit, Visit} from './Visit';

export interface MergedPatientQueueModel {
    patientdata: Patient;
    queuedata: Visit;
}

export const emptymergedQueueModel: MergedPatientQueueModel = {
    queuedata: {...emptypatientvisit},
    patientdata: {...emptypatient}
};