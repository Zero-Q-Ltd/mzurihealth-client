import { emptypatient, Patient } from '../patient/Patient';
import { Queue, emptyqueue, QueueRefs } from '../hospital/Queue';
import { emptymedicalInfo, MedicalInfo } from '../patient/MedicalInfo';

export interface MergedPatientQueueModel {
    patientdata: Patient;
    queuedata: QueueRefs;
}

export const emptymergedQueueModel: MergedPatientQueueModel = {
    queuedata: null,
    patientdata: { ...emptypatient },
};

export interface CurrentPatient {
    patientdata: Patient;
    queuedata: QueueRefs;
    medicalInfo: MedicalInfo;
};

