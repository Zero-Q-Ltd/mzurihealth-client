import * as BSON from 'bson';

export interface ProcedureCategory {
    name: string;
    code: string;
    _id: BSON.ObjectId;
    /**
     * used to conditionally disable this category
     */
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
    _id: null,
    status: null,
    subcategories: {}
};

