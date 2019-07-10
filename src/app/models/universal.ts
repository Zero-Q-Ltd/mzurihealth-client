export interface Customfields {
    id: number;
    value: any;
    name: string;
}

export interface Metadata {
    date: Date;
    lastEdit: Date;
}

export const emptymetadata: Metadata = {
    date: null,
    lastEdit: null
};
