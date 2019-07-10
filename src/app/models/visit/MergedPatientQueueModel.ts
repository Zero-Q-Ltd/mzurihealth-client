import {emptypatient, Patient} from '../patient/Patient';
import {emptypatientvisit, PatientVisit} from './PatientVisit';

export interface MergedPatientQueueModel {
    patientdata: Patient;
    queuedata: PatientVisit;
}

export const emptymergedQueueModel: MergedPatientQueueModel = {
    queuedata: {...emptypatientvisit},
    patientdata: {...emptypatient}
};