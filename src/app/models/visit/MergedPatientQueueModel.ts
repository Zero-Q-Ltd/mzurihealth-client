import { emptypatient, Patient } from '../patient/Patient';
import { MedicalInfo } from '../patient/MedicalInfo';
import { Visit, emptypatientvisit } from './Visit';

export interface MergedPatientQueueModel {
    patientdata: Patient;
    visitData: Visit;
}

export const emptymergedQueueModel: MergedPatientQueueModel = {
    visitData: { ...emptypatientvisit },
    patientdata: { ...emptypatient },
};

export interface CurrentPatient {
    patientdata: Patient;
    medicalInfo: MedicalInfo;
    visitdata: Visit;
}

