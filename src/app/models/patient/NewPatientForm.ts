import {Insurance, NextofKin, PersonalInfo} from './Patient';

export interface NewPatientForm {
    personalInfo: PersonalInfo;
    fileNo: string;
    /**
     * Optional parent id number for minors
     */
    parentid?: string;

    nextofKin: NextofKin;
    /**
     * A patient can have several insurances at the same time
     */
    insurance?: Array<Insurance>;

}