import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationRouting, NotificationsCommunicationService } from '@backbase/notifications-ang';

@Injectable({
  providedIn: 'root',
})
export class NotificationsCommunication implements NotificationsCommunicationService {
  constructor(private router: Router) {}

  notificationNavigation(routing: NotificationRouting): void {
    const payloadId = (routing.data && routing.data.id) || '';
    const arrangementId = routing.data?.arrangementId;

    switch (routing['where-to']) {
      case 'conversation-view':
        this.router.navigate(['/messages/inbox/conversation', { id: payloadId }]);
        break;
      case 'transaction-view':
        this.router.navigate(['accounts/details', { selectedAccount: arrangementId }, 'transactions']);
        break;
      case 'arrangement-view':
        this.router.navigate(['accounts/details', { selectedAccount: payloadId }, 'info']);
        break;
      case 'party-view':
        this.router.navigate(['/contacts/my-requests']);
        break;
      case 'party-approve-view':
        this.router.navigate(['/contacts/pending-approvals']);
        break;
      case 'payment-view':
        this.router.navigate(['/transfers/one-off']);
        break;
      case 'payment-approve-view':
        this.router.navigate(['/transfers/one-off']);
        break;
      case 'payments-list-view':
        this.router.navigate(['/transfers/one-off']);
        break;
      case 'audit-download-view':
        this.router.navigate(['/audit/download'], {
          queryParams: {
            exportId: this.getAuditExportId(routing.data),
          },
        });
        break;
      case 'account-statements-archive-download-view':
        this.router.navigate(['/account-statements/download'], {
          queryParams: {
            archiveId: this.getAccountStatementsArchiveId(routing.data?.link || ''),
          },
        });
        break;
      default:
        console.warn('Route is not supported');
    }
  }

  openNotificationSettings() {
    this.router.navigate(['/my-profile/manage-notifications']);
  }

  private getAuditExportId(data?: any): string | undefined {
    if (!data) {
      return undefined;
    }
    if (data.exportId) {
      return data.exportId;
    }
    if (data.link) {
      try {
        const url = new URL(data.link, location.origin);
        return url.searchParams.get('contentId') || undefined;
      } catch (e) {
        // malformed URL
        return undefined;
      }
    }
    return undefined;
  }

  private getAccountStatementsArchiveId(link: string): string {
    const segments = link.split('/');
    segments.reverse();
    return segments[0];
  }
}
