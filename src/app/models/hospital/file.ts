
export interface HospFile {
    id: string;
    date: Date;
    lastVisit: Date;
    no: string;
    idno: number;
    visitCount: number;
}

export const emptyfile: HospFile = {
    id: null,
    date: null,
    lastVisit: null,
    no: '0',
    idno: null,
    visitCount: 0
};
