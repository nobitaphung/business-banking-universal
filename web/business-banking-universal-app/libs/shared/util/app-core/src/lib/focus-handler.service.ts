import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FocusHandlerService {
  public findFirstTabbableElement(element: HTMLElement): HTMLElement {
    return this.findAllTabbableElements(element)[0];
  }

  public findAllTabbableElements(element: HTMLElement): NodeListOf<HTMLElement> {
    return element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  }

  public skipToContent(event: UIEvent): void {
    const mainSection = event.view?.window?.document?.querySelector('[role="main"]') as HTMLElement;
    if (mainSection) {
      this.findFirstTabbableElement(mainSection).focus();
    }
  }
}
