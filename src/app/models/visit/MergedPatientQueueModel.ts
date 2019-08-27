import { emptypatient, Patient } from '../patient/Patient';
import { Queue, emptyqueue, QueueRef } from '../hospital/Queue';
import { emptymedicalInfo, MedicalInfo } from '../patient/MedicalInfo';

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
};

