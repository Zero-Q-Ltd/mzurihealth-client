import {Insurance, PersonalInfo, NextofKin} from './Patient';

export interface AddPatientFormModel {
    personaLinfo: PersonalInfo;
    nextofkin: NextofKin;
    insurance: Array<Insurance>;
    fileNo: string;
}

