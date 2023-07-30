//
//  Created by Backbase R&D B.V. on 21/01/2020.
//

import UIKit
import Backbase
import BusinessUniversalApp
import BackbaseDesignSystem
import BackbaseObservability
import Resolver

@UIApplicationMain
class AppDelegate: BusinessUniversalAppDelegate {
    override init() {
        DesignSystem.initialize(jsonName: "designTokens")

        super.init { (sdk, design) in
            sdk.configPath = "config.json"

            return { app in
                app.splashScreen.backgroundImage = UIImage(named: "splash_background")
                app.splashScreen.logoImage = UIImage(named: "backbase_logo_white")
                app.accountsAndTransactionsJourney.accounts.accountsList.navigationTitleView = .fullLogo( (name: "backbase_logo_white", bundle: Bundle.main))
                app.omniPaymentsJourney = JourneysConfiguration.omniPayments
                app.contactsManager = JourneysConfiguration.contactsManager

                #if !DEBUG
                    Backbase.denyWhenJailbroken()
                    Backbase.denyWhenReverseEngineered()
                #endif
            }
        }
    }
    override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]?) -> Bool {
        let result = super.application(application, didFinishLaunchingWithOptions: launchOptions)
        setupTrackers()
        return result
    }

    override func applicationDidEnterBackground(_ application: UIApplication) {
        super.applicationDidEnterBackground(application)
        Security.handleApplicationDidEnterBackground(application)
    }

    override func applicationWillEnterForeground(_ application: UIApplication) {
        super.applicationWillEnterForeground(application)
        Security.handleApplicationWillEnterForeground(application)
    }

    override func application(_ application: UIApplication, shouldAllowExtensionPointIdentifier extensionPointIdentifier: UIApplication.ExtensionPointIdentifier) -> Bool {

        return super.application(application, shouldAllowExtensionPointIdentifier: extensionPointIdentifier) &&
            Security.shouldAllowExtensionPoint(with: extensionPointIdentifier)
    }
}

extension AppDelegate {
    func setupTrackers() {
        let tracker = Resolver.optional(Tracker.self)
        tracker?.subscribe(
            subscriber: self,
            eventClass: ScreenViewEvent.self) { event in
            print("Screen event name: \(event.name)")
            print("Screen event journey: \(event.journey)")
        }
    }
}
