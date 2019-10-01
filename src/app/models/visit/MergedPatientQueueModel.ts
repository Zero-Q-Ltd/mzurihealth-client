import { emptypatient, Patient } from '../patient/Patient';
import { QueueRef } from '../hospital/Queue';
import { MedicalInfo } from '../patient/MedicalInfo';
import { Visit } from './Visit';

export interface MergedPatientQueueModel {
    patientdata: Patient;
    queuedata: QueueRef;
}

export const emptymergedQueueModel: MergedPatientQueueModel = {
    queuedata: null,
    patientdata: { ...emptypatient },
};

export interface CurrentPatient {
    patientdata: Patient;
    queuedata: QueueRef;
    medicalInfo: MedicalInfo;
    visitdata: Visit
}

