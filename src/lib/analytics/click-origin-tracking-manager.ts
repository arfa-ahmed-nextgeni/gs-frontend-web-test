"use client";

import type { ClickOrigin } from "./models/event-models";

/**
 * Click Origin Tracking Manager
 * Manages click origin information for internal source tracking
 * Stores the last click origin and provides methods to retrieve and reset it
 * Similar pattern to BannerTrackingManager
 */
class ClickOriginTrackingManager {
  private clickOrigin: ClickOrigin | null = null;
  private pdpNavigationSource: "cart" | null = null;

  consumePdpNavigationSource(): "cart" | null {
    const source = this.pdpNavigationSource;
    this.pdpNavigationSource = null;

    return source;
  }

  /**
   * Get the current click origin
   * Returns null if no click origin has been set or if it was reset
   */
  getClickOrigin(): ClickOrigin | null {
    return this.clickOrigin;
  }

  /**
   * Reset the click origin
   * Called when certain events occur or when navigation happens
   */
  resetClickOrigin(): void {
    this.clickOrigin = null;
  }

  /**
   * Set the click origin
   * Should be called when user clicks on an element that should be tracked
   * @param origin - The click origin to store
   */
  setClickOrigin(origin: ClickOrigin): void {
    this.clickOrigin = origin;
  }

  setPdpNavigationSource(source: "cart"): void {
    this.pdpNavigationSource = source;
  }
}

// Export singleton instance
export const clickOriginTrackingManager = new ClickOriginTrackingManager();
