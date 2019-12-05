import { Metadata } from '../universal';

export enum MedConditions {
    'Alzheimer\'s' = 'Alzheimer\'s'
    , 'Arthritis' = 'Arthritis'
    , 'Asthma' = 'Asthma'
    , 'Blood Pressure' = 'Blood Pressure'
    , 'Cancer' = 'Cancer'
    , 'Cholesterol' = 'Cholesterol'
    , 'Chronic Pain' = 'Chronic Pain'
    , 'Cold & Flu' = 'Cold & Flu'
    , 'Depression' = 'Depression'
    , 'Diabetes' = 'Diabetes'
    , 'Dictionary' = 'Dictionary'
    , 'Digestion' = 'Digestion'
    , 'Eyesight' = 'Eyesight'
    , 'Health & Living' = 'Health & Living'
    , 'Healthy Kids' = 'Healthy Kids'
    , 'Hearing & Ear' = 'Hearing & Ear'
    , 'Heart' = 'Heart'
    , 'HIV/AIDS' = 'HIV/AIDS'
    , 'Infectious Disease' = 'Infectious Disease'
    , 'Lung Conditions' = 'Lung Conditions'
    , 'Medications' = 'Medications'
    , 'Menopause' = 'Menopause'
    , 'Men\'s Health' = 'Men\'s Health'
    , 'Mental Health' = 'Mental Health'
    , 'Migraine' = 'Migraine'
    , 'Neurology' = 'Neurology'
    , 'Oral Health' = 'Oral Health'
    , 'Pregnancy' = 'Pregnancy'
    , 'Senior Health' = 'Senior Health'
    , 'Sexual Health' = 'Sexual Health'
    , 'Skin' = 'Skin'
    , 'Sleep' = 'Sleep'
    , 'Thyroid' = 'Thyroid'
    , 'Travel Health' = 'Travel Health'
    , 'Women\'s Health' = 'Women\'s Health'
}
export const medicalconditionsarray = Object.values(MedConditions);
export interface Condition {
    type: MedConditions;
    detail: string;
    metadata: Metadata;
}

