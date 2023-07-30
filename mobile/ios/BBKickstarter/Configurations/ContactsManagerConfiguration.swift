//
//  Created by Backbase R&D B.V. on 16/02/2022.
//

import Foundation

import BusinessContactsManagerJourney
import FlagKit

extension JourneysConfiguration {
    static let contactsManager: ContactsManager.Configuration = .default
}

extension ContactsManager.Configuration {
    static let `default`: Self = {
        var configuration = ContactsManager.Configuration()

        let countryNameHandler: (String) -> (String?) = {
            Locale.autoupdatingCurrent.localizedString(forRegionCode: $0)
        }
        let countryFlagHandler: (String) -> (UIImage?) = { Flag(countryCode: $0)?.originalImage }

        configuration.countryFlagHandler = countryFlagHandler
        configuration.countryNameHandler = countryNameHandler

        return configuration
    }()
}
