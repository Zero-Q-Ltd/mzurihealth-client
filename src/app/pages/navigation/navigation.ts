import {FuseNavigation} from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id: 'Hospital',
        title: 'Hospital',
        translate: 'NAV.Hospital',
        type: 'group',
        children: [
            {
                id: 'SuperAdmin',
                title: 'SuperAdmin',
                translate: 'NAV.superadmin',
                type: 'item',
                icon: 'settings',
                url: 'superadmin',
                // badge    : {
                //     title    : '25',
                //     translate: 'NAV.SAMPLE.BADGE',
                //     bg       : '#F44336',
                //     fg       : '#FFFFFF'
                // }
            },
            {
                id: 'Dashboard',
                title: 'Dashboard',
                translate: 'NAV.dashboard',
                type: 'item',
                icon: 'dashboard',
                url: 'dashboard',
                // badge    : {
                //     title    : '25',
                //     translate: 'NAV.SAMPLE.BADGE',
                //     bg       : '#F44336',
                //     fg       : '#FFFFFF'
                // }
            },
            {
                id: 'Appointments',
                title: 'Appointments',
                translate: 'NAV.appointments',
                type: 'item',
                icon: 'today',
                url: 'appointments',
            }
        ]
    },
    {
        id: 'Patients',
        title: 'Patients',
        // translate: 'NAV.Patients',
        type: 'group',
        children: [
            {
                id: 'All',
                title: 'All',
                // translate: 'NAV.all',
                type: 'item',
                icon: 'people',
                url: 'patients/all',
            },
            {
                id: 'Add',
                title: 'Add',
                // translate: 'NAV.add',
                type: 'item',
                icon: 'person_add',
                url: 'patients/add',
            },
            {
                id: 'Queue',
                title: 'Queue',
                // translate: 'NAV.add',
                type: 'item',
                icon: 'weekend',
                url: 'patients/queue',
            }
        ]
    },
    {
        id: 'Payments',
        title: 'Payments',
        // translate: 'NAV.Patients',
        type: 'group',
        children: [
            {
                id: 'All',
                title: 'All',
                // translate: 'NAV.all',
                type: 'item',
                icon: 'payment',
                url: 'payments/all',
            },
            // {
            //     _id: 'Today',
            //     title: 'Add',
            //     // translate: 'NAV.add',
            //     type: 'item',
            //     icon: 'today',
            //     url: 'payments/today',
            // }
        ]
    },
    {
        id: 'Usability',
        title: 'Usability',
        // translate: 'NAV.Patients',
        type: 'group',
        children: [
            {
                id: 'knowledge-base',
                title: 'Knowledge Base',
                type: 'item',
                icon: 'import_contacts',
                url: 'knowledge-base'
            }
        ]
    },

];
