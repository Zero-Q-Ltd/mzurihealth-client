import {AppEnvironment} from './model';

const production = false;
export const defaultEnvironmentConfig: AppEnvironment = {
    /**
     * Production environment
     */
    production: production,
    hmr: false,

    /**
     * MongoDB Stitch settings
     */
    mongo: {
        stitchAppId: 'stitch-uyxfz',
        database: production ? 'live' : 'dev',
    },
};
