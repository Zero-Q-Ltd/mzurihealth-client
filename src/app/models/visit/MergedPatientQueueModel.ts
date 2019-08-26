import { emptypatient, Patient } from '../patient/Patient';
import { Queue, emptyqueue, QueueRefs } from '../hospital/Queue';

export interface MergedPatientQueueModel {
    patientdata: Patient;
    queuedata: QueueRefs;
}

export const emptymergedQueueModel: MergedPatientQueueModel = {
    queuedata: null,
    patientdata: { ...emptypatient }
}
