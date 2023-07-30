//
//  Created by Backbase R&D B.V. on 20/12/2022.
//

import BusinessOmniPaymentsJourney
import BackbaseDesignSystem
import FlagKit
import UIKit
import BusinessJourneyCommon
import Resolver
import Backbase

class SharedViews {

    static var localized: (String) -> (LocalizedString) = { key in
        return LocalizedString(key: key, in: Bundle(for: OmniPayments.self))
    }

    public static func duplicateViewHeader(
        paymentOrdersResponse: PaymentOrdersResponse
    ) -> UIView {

        let topContainerView = UIView()

        let badgeLabel = SharedViews.paymentOrderStatusBadgeView(
            status: paymentOrdersResponse.status
        )
        topContainerView.addSubview(badgeLabel)

        badgeLabel.snp.makeConstraints { make in
            make.leading.equalTo(topContainerView).offset(DesignSystem.shared.spacer.md)
            make.top.equalTo(topContainerView).offset(DesignSystem.shared.spacer.md)
        }


        let createdByLabel = UILabel()
        topContainerView.addSubview(createdByLabel)
        createdByLabel.snp.makeConstraints { make in
            make.leading.equalTo(topContainerView).offset(DesignSystem.shared.spacer.md)
            make.top.equalTo(badgeLabel.snp.bottom).offset(DesignSystem.shared.spacer.sm)
            make.trailing.equalTo(topContainerView).offset(-DesignSystem.shared.spacer.md)
        }
        createdByLabel.text = localized("omniPayments.duplicatePayment.details.createdBy")()
        createdByLabel.font = DesignSystem.shared.fonts.preferredFont(.subheadline, .regular)
        createdByLabel.numberOfLines = 0
        createdByLabel.adjustsFontForContentSizeCategory = true
        createdByLabel.textColor = DesignSystem.shared.colors.text.support

        let nameLabel = UILabel()
        topContainerView.addSubview(nameLabel)
        nameLabel.snp.makeConstraints { make in
            make.leading.equalTo(topContainerView).offset(DesignSystem.shared.spacer.md)
            make.top.equalTo(createdByLabel.snp.bottom).offset(DesignSystem.shared.spacer.xs)
            make.trailing.equalTo(topContainerView).offset(-DesignSystem.shared.spacer.md)
        }
        nameLabel.text = paymentOrdersResponse.createdBy
        nameLabel.numberOfLines = 0
        nameLabel.adjustsFontForContentSizeCategory = true
        nameLabel.textColor = .label
        nameLabel.font = DesignSystem.shared.fonts.preferredFont(.subheadline, .semibold)
        nameLabel.textColor = DesignSystem.shared.colors.text.default

        let dateLabel = UILabel()
        topContainerView.addSubview(dateLabel)
        dateLabel.snp.makeConstraints { make in
            make.leading.equalTo(topContainerView).offset(DesignSystem.shared.spacer.md)
            make.top.equalTo(nameLabel.snp.bottom).offset(DesignSystem.shared.spacer.xs)
            make.trailing.equalTo(topContainerView).offset(-DesignSystem.shared.spacer.md)
            make.bottom.equalTo(topContainerView.snp.bottom).offset(-DesignSystem.shared.spacer.lg)
        }

        let dateFormatter = SharedViews.dateFormatterCreationDateFormatter()

        if let date = paymentOrdersResponse.createdAt {
            dateLabel.text = dateFormatter.string(from: date)
        }
        dateLabel.font = DesignSystem.shared.fonts.preferredFont(.subheadline, .regular)
        dateLabel.adjustsFontForContentSizeCategory = true
        dateLabel.numberOfLines = 0
        dateLabel.textColor = DesignSystem.shared.colors.text.default

        return topContainerView

    }

    private static func dateFormatterCreationDateFormatter() -> DateFormatter {
        let dateFormatter = DateFormatter()

        let timeZone: TimeZone
        if let timeZoneIdentifier = Backbase.configuration().bankTimeZone,
           let zone = TimeZone(identifier: timeZoneIdentifier) {
            timeZone = zone
        } else {
            timeZone = .current
        }
        dateFormatter.timeZone = timeZone

        let prefferedLocale: Locale
        if let preferredLocaleIdentifier = Locale.preferredLanguages.first {
            prefferedLocale = Locale(identifier: preferredLocaleIdentifier)
        } else {
            prefferedLocale = Locale.current
        }

        dateFormatter.locale = prefferedLocale
        dateFormatter.dateStyle = .medium
        dateFormatter.timeStyle = .medium

        return dateFormatter
    }

    private static func paymentOrderStatusBadgeView(
        status: OmniPayment.Status
    ) -> Badge {
        let badgeTitle: String

        switch status {

        case .accepted:
            badgeTitle = localized("duplicatePayment.status.accepted")()
        case .cancellationPending:
            badgeTitle = localized("duplicatePayment.status.cancellationPending")()
        case .cancelled:
            badgeTitle = localized("duplicatePayment.status.cancelled")()
        case .entered:
            badgeTitle = localized("duplicatePayment.status.entered")()
        case .processed:
            badgeTitle = localized("duplicatePayment.status.processed")()
        case .rejected:
            badgeTitle = localized("duplicatePayment.status.rejected")()
        case .ready:
            badgeTitle = localized("duplicatePayment.status.ready")()
        case .draft:
            badgeTitle = ""
        default:
            badgeTitle = ""

        }
        let badgeLabel = Badge(text: badgeTitle)

        badgeLabel.accessibilityIdentifier = "statusBadge"


        switch status {
        case .entered, .ready:
            DesignSystem.shared.styles.infoBadge(badgeLabel)
            badgeLabel.isHidden = false
        case .accepted, .processed:
            DesignSystem.shared.styles.successBadge(badgeLabel)
            badgeLabel.isHidden = false
        case .rejected:
            DesignSystem.shared.styles.dangerBadge(badgeLabel)
            badgeLabel.isHidden = false
        case .cancelled, .cancellationPending:
            DesignSystem.shared.styles.warningBadge(badgeLabel)
            badgeLabel.isHidden = false
        default:
            badgeLabel.isHidden = true
        }

        return badgeLabel
    }


}
