import {Insurance, NextofKin, PersonalInfo} from './Patient';

export interface AddPatientFormModel {
    personaLinfo: PersonalInfo;
    nextofkin: NextofKin;
    insurance: Array<Insurance>;
    fileNo: string;
}

