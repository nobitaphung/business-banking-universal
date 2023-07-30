# {Bank name here} business banking application
This project contains the minimum setup for the Business Banking Universal App.

## Project setup
After downloading the app for the first time, you will not be able to build it.
This is due to the fact that you have to setup your Gradle credentials. Note that this also needs to
be done on your automated build server once you have it up and running.

### Set up Gradle credentials
1. Navigate to ~/.gradle/ in your system directory, note the ~ symbol.
2. If it does not already exist, create a file called gradle.properties (touch gradle.properties on the command line)
3. Log in to Repo/Artifactory and click on your name in the top right.
4. Type in your password to get access to your encrypted password. Copy your encrypted password.
5. Add the following lines to the gradle.properties file:

```
repoRepoUrl=https://repo.backbase.com/android
repoRetailRepoUrl=https://repo.backbase.com/android-retail
repoBusinessRepoUrl=https://repo.backbase.com/android-business
repoDesignRepoUrl=https://repo.backbase.com/design-android
repoIdentityRepoUrl=https://repo.backbase.com/android-identity
repoFlowRepoUrl=https://repo.backbase.com/android-flow-production
repoEngagementChannelsRepoUrl=http://repo.backbase.com/android-engagement-channels
repoMobileNotificationsRepoUrl=http://repo.backbase.com/android-mobile-notifications

backbaseRepoUsername=<your Backbase repo username>
backbaseRepoEncryptedPassword=<your Backbase repo encrypted password>
```

You may need to restart Android Studio for it to recognize the new gradle.properties file

## Environment setup
1) Navigate to app/src/main/assets/config.json
2) Replace fake json with below json data to run with business banking latest environment.
    {
     "development": {
       "debugEnable": false
     },
     "backbase": {
       "serverURL": "https://edge.universal-latest.business.backbase.eu",
       "experience": "",
       "localModelPath": "$(contextRoot)/conf/localModel.json",
       "version": "6.2.3.1",
       "identity": {
         "baseURL": "https://identity.universal-latest.business.backbase.eu",
         "clientId": "mobile-client",
         "realm": "backbase",
         "applicationKey": "business"
       }
     },
     "security": {
       "allowedDomains": [
         "*"
       ]
     }
   }

## Run
### Identity SDK
This project takes the dependency of
[Identity SDK](https://community.backbase.com/documentation/identity/latest/isdk_reference) for managing authentication
of all users. The SDK warrants that we add
[FacetID](https://community.backbase.com/documentation/mobile-sdk/3-6-11/FIDO_support?bb=1#facet_ids) to the configured
environment. FacetID is a unique key mapped with your debug.keystore.
Kindly go through this document and retrieve your machine's FacetID, then pass the same to either the
team managing the environment or the project owner.