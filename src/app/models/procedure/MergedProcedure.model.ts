import {RawProcedure} from './RawProcedure';
import {CustomProcedure} from './CustomProcedure';

export interface MergedProcedureModel {
    rawProcedure: RawProcedure;
    customProcedure: CustomProcedure;
}