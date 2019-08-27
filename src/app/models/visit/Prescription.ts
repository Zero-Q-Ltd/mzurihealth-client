
export interface Prescription {
    meds: Array<Med>;
    notes: string;
}

interface Med {
    drug: string;
    dosage: string;
    notes: string;
} 
