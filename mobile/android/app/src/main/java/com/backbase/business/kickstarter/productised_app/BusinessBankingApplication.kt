package com.backbase.business.kickstarter.productised_app

import com.backbase.android.business.app.universal.BusinessUniversalApp
import com.backbase.android.core.errorhandling.ErrorCodes
import com.backbase.android.core.security.environment.EnvironmentVerification
import com.backbase.android.listeners.SecurityViolationListener
import com.backbase.android.utils.net.response.Response
import com.google.firebase.FirebaseApp
import com.google.firebase.messaging.FirebaseMessaging

/**
 * Created by Backbase R&D B.V on 30/06/2020.
 * Productized app for the entire business banking collection
 */
class BusinessBankingApplication :
    BusinessUniversalApp(configurationUniversal = Configuration.apply()),
    SecurityViolationListener {
    override fun onCreate() {
        super.onCreate()
        FirebaseApp.initializeApp(this)
        FirebaseMessaging.getInstance().subscribeToTopic("all")

        // Check for security conditions in Release Mode
        if (BuildConfig.BUILD_TYPE == "release") {
            EnvironmentVerification.getInstance().debuggerDetector.enableAntiNativeDebug()

            val isEmulator = EnvironmentVerification.getInstance()
                .getEmulatorDetector(this)
                .isEmulator

            val isRooted = EnvironmentVerification.getInstance()
                .getRootVerification(this)
                .withRootManagementApps()
                .withPotentiallyDangerousApps()
                .withSuBinary()
                .isRooted

            EnvironmentVerification.getInstance().activityHijackDetector.start(this)

            if (isRooted || isEmulator) {
                throw IllegalStateException("Crashing intentionally")
            }
        }
    }

    override fun onSecurityViolation(errorResponse: Response) {
        //There can be more response codes and error,
        // we are interested only in activity breach as of now
        if (errorResponse.responseCode == ErrorCodes.SECURITY_BREACH_ACTIVITY_HIJACKING.code) {
            throw IllegalStateException("Crashing intentionally")
        }
    }
}