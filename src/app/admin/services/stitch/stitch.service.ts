import {Injectable, NgZone} from '@angular/core';
import {
    AnonymousCredential,
    GoogleRedirectCredential,
    RemoteMongoClient,
    RemoteMongoDatabase,
    Stitch,
    StitchAppClient,
    StitchAppClientConfiguration,
    StitchAuth,
    StitchUser
} from 'mongodb-stitch-browser-sdk';

import {environment} from '../../../../environments/environment';
import {HttpStitchTransport} from './http-stitch-transport';
import {ReplaySubject} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StitchService {
    client!: StitchAppClient;
    auth!: StitchAuth;
    db!: RemoteMongoDatabase;
    user: ReplaySubject<StitchUser> = new ReplaySubject<StitchUser>(1);

    public constructor(private zone: NgZone, private transport: HttpStitchTransport) {
        // Run it outside Angular, so it doesn't result with any change detection events etc...
        zone.runOutsideAngular(() => this.createStitchApp());
        /**
         * connect to the database as soo as the service is loaded onto mem
         */
        this.auth.addAuthListener({onAuthEvent: this.onStitchAuthEvent.bind(this)});

    }

    protected createStitchApp(): void {
        const stitchAppId = environment.mongo.stitchAppId;
        this.client = Stitch.initializeAppClient(stitchAppId);

        // Just a shortcut to StitchAuth, since it's often accessed
        this.auth = this.client.auth;

        // It's OK to get RemoteMongoDatabase *before* connecting/authenticating the client
        this.db = this.client.getServiceClient(RemoteMongoClient.factory, 'mongodb-atlas').db(environment.mongo.database);
        // console.log('StitchService#createStitchApp', {
        //   loggedIn: this.client.auth.isLoggedIn,
        //   hasRedirectResult: this.auth.hasRedirectResult(),
        //   user: this.client.auth.user,
        //   client: this.client,
        //   auth: this.auth,
        //   db: this.db,
        // });

        this.handleRedirectResultIfNeeded();
    }

    private onStitchAuthEvent(auth: StitchAuth): void {
        // console.log('AuthService#onStitchAuthEvent', auth);
        if (auth.user && auth.user.loggedInProviderType !== 'anon-user') {
            this.user.next(auth.user);
        }
    }


    public connectToDbAsAnonymous(): Promise<StitchUser> {
        return this.auth.loginWithCredential(new AnonymousCredential());
        // .then((user: StitchUser) => {
        //   console.log('StitchService#connectToDbAsAnonymous, connected', user);
        //   return user;
        // });
    }

    /**
     * De-authenticate current user's session.
     * Note that because MongoDB Stitch needs to have always valid session,
     * we need to re-authenticate again, at least with anonymous credentials,
     * so the app can work (like before user logged in).
     */
    public logout(): void {
        this.auth.logout();
    }

    /**
     * Handle Stitch authentication results from external auth providers
     * which are present in the URL (and they disappear after we call .handleRedirectResult()).
     * After that user is authenticated and the tokens are put in local storage.
     */
    public handleRedirectResultIfNeeded(): void {
        if (this.auth.hasRedirectResult()) {
            this.auth.handleRedirectResult().then((u: StitchUser) => {
                // NOTE: not sure how to handle this case.
                // Seems like callback called from `stitch.auth.addAuthListener` doesn't
                // emit full user after `handleRedirectResult()` has been called.
                // Therefore we re-emit it here.
                // TODO: this is tight coupled, must be somehow resolved...
            });
        }
    }

    loginWithGoogle(): void {
        const credential = new GoogleRedirectCredential('http://localhost:4200/admin');
        return this.auth.loginWithRedirect(credential);
    }
}
