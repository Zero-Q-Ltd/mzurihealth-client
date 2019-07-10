export interface ProcedureCategory {
    name: string;
    code: string;
    id: string;
    status: boolean;
    subcategories: {
        /**
         * Used an object so that deletions do not force database refactoring
         */
        [key: number]: {
            name: string;
            parents: Array<number> | null
        }
    };
}

export const emptyprocedurecategory: ProcedureCategory = {
    name: null,
    code: null,
    id: null,
    status: null,
    subcategories: {}
};

