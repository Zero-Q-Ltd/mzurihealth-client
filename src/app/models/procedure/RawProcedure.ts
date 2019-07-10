export interface RawProcedure {
    name: string;
    id: string;
    pricing: {
        max: number | string,
        min: number | string,
    };
    category: RawProcedureCategory;
    numericid: number;
}

export interface RawProcedureCategory {
    id: string;
    code: string;
    subCategoryId: string | null;
}

export const emptyprawrocedure: RawProcedure = {
    name: null,
    id: null,
    pricing: {
        min: 0,
        max: 0
    },
    numericid: null,
    category: {
        id: null,
        code: null,
        subCategoryId: null
    },
};
