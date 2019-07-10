import {Insurance} from './Patient';

export interface AddPatientFormModel {
    personaLinfo: {
        firstName: string,
        lastName: string,
        occupation: string,
        idNo: number,
        gender: string,
        birth: string,
        email: string,
        workplace: string,
        phone: string,
        address: string,
        fileno: string,
    };
    nextofkin: {
        relationship: string;
        name: string,
        phone: number,
        workplace: string
    };

    insurance: Array<Insurance>;
}

