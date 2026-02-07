// Accessibility utilities and helpers for WCAG compliance

export const ARIA_LABELS = {
  // Navigation
  MAIN_NAVIGATION: 'Main navigation',
  SKIP_TO_CONTENT: 'Skip to main content',
  SKIP_TO_NAVIGATION: 'Skip to navigation',

  // Forms
  REQUIRED_FIELD: 'Required field',
  OPTIONAL_FIELD: 'Optional field',
  FORM_ERROR: 'Form error',
  FORM_SUCCESS: 'Form success',

  // Buttons and Actions
  CLOSE_BUTTON: 'Close',
  OPEN_MENU: 'Open menu',
  CLOSE_MENU: 'Close menu',
  EXPAND_SECTION: 'Expand section',
  COLLAPSE_SECTION: 'Collapse section',
  LOAD_MORE: 'Load more items',
  REFRESH_DATA: 'Refresh data',

  // Status and Feedback
  LOADING: 'Loading',
  PROCESSING: 'Processing',
  SUCCESS: 'Success',
  ERROR: 'Error',
  WARNING: 'Warning',
  INFO: 'Information',

  // Data Tables
  SORT_ASCENDING: 'Sort ascending',
  SORT_DESCENDING: 'Sort descending',
  SORT_NONE: 'Not sorted',
  ROW_SELECTED: 'Row selected',
  ROW_UNSELECTED: 'Row unselected',

  // Charts and Visualizations
  CHART_DESCRIPTION: 'Data visualization',
  EXPAND_CHART: 'Expand chart view',
  COLLAPSE_CHART: 'Collapse chart view',

  // File Operations
  UPLOAD_FILE: 'Upload file',
  DOWNLOAD_FILE: 'Download file',
  DELETE_FILE: 'Delete file',
  PREVIEW_FILE: 'Preview file',

  // Search and Filter
  SEARCH_INPUT: 'Search',
  FILTER_OPTIONS: 'Filter options',
  CLEAR_FILTERS: 'Clear all filters',
  APPLY_FILTERS: 'Apply filters',
} as const;

// Keyboard navigation helpers
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

// Focus management utilities
export class FocusManager {
  private static focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  static getFocusableElements(container: HTMLElement = document.body): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.TAB) {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }

      if (e.key === KEYBOARD_KEYS.ESCAPE) {
        // Allow escape to close modals/dialogs
        const closeButton = container.querySelector('[aria-label="Close"]') as HTMLElement;
        closeButton?.click();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    // Focus first element
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  static moveFocus(element: HTMLElement): void {
    element.focus();
    // Scroll into view if needed
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Screen reader announcements
export class ScreenReader {
  private static announcer: HTMLElement | null = null;

  private static getAnnouncer(): HTMLElement {
    if (!this.announcer) {
      this.announcer = document.createElement('div');
      this.announcer.setAttribute('aria-live', 'polite');
      this.announcer.setAttribute('aria-atomic', 'true');
      this.announcer.style.position = 'absolute';
      this.announcer.style.left = '-10000px';
      this.announcer.style.width = '1px';
      this.announcer.style.height = '1px';
      this.announcer.style.overflow = 'hidden';
      document.body.appendChild(this.announcer);
    }
    return this.announcer;
  }

  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcer = this.getAnnouncer();
    announcer.setAttribute('aria-live', priority);
    announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }

  static announceError(message: string): void {
    this.announce(`Error: ${message}`, 'assertive');
  }

  static announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }

  static announceLoading(message: string): void {
    this.announce(`Loading: ${message}`, 'polite');
  }
}

// Color contrast utilities
export class ColorContrast {
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 1;

    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  static meetsWCAGStandard(ratio: number, level: 'AA' | 'AAA' = 'AA', size: 'normal' | 'large' = 'normal'): boolean {
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    }
    return size === 'large' ? ratio >= 3 : ratio >= 4.5;
  }
}

// Skip links component utility
export const createSkipLinks = (): HTMLElement => {
  const skipLinks = document.createElement('div');
  skipLinks.className = 'skip-links';
  skipLinks.innerHTML = `
    <a href="#main-content" class="skip-link">${ARIA_LABELS.SKIP_TO_CONTENT}</a>
    <a href="#main-navigation" class="skip-link">${ARIA_LABELS.SKIP_TO_NAVIGATION}</a>
  `;

  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .skip-links {
      position: absolute;
      top: -40px;
      left: 6px;
      z-index: 1000;
    }
    .skip-link {
      position: absolute;
      top: -40px;
      left: 6px;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      border-radius: 4px;
      z-index: 1000;
      transition: top 0.3s;
    }
    .skip-link:focus {
      top: 6px;
    }
  `;
  document.head.appendChild(style);

  return skipLinks;
};

// Form accessibility helpers
export class FormAccessibility {
  static announceFormError(fieldName: string, errorMessage: string): void {
    ScreenReader.announceError(`${fieldName}: ${errorMessage}`);
  }

  static announceFormSuccess(message: string): void {
    ScreenReader.announceSuccess(message);
  }

  static setFieldError(field: HTMLElement, errorMessage: string): void {
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', `${field.id}-error`);

    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
      errorElement.textContent = errorMessage;
    }
  }

  static clearFieldError(field: HTMLElement): void {
    field.setAttribute('aria-invalid', 'false');
    field.removeAttribute('aria-describedby');

    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
      errorElement.textContent = '';
    }
  }
}

// Table accessibility helpers
export class TableAccessibility {
  static makeTableAccessible(table: HTMLTableElement): void {
    // Add table role if not present
    if (!table.getAttribute('role')) {
      table.setAttribute('role', 'table');
    }

    // Ensure table has a caption or aria-label
    if (!table.querySelector('caption') && !table.getAttribute('aria-label')) {
      table.setAttribute('aria-label', 'Data table');
    }

    // Add row roles
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      if (!row.getAttribute('role')) {
        row.setAttribute('role', 'row');
      }
    });

    // Add cell roles
    const cells = table.querySelectorAll('td, th');
    cells.forEach(cell => {
      if (!cell.getAttribute('role')) {
        cell.setAttribute('role', cell.tagName === 'TH' ? 'columnheader' : 'cell');
      }
    });
  }

  static announceTableSort(columnName: string, direction: 'ascending' | 'descending' | 'none'): void {
    const directionText = direction === 'ascending' ? 'ascending' :
                         direction === 'descending' ? 'descending' : 'none';
    ScreenReader.announce(`Column ${columnName} sorted ${directionText}`);
  }
}

// Modal/Dialog accessibility
export class ModalAccessibility {
  static makeModalAccessible(modal: HTMLElement): () => void {
    // Set up ARIA attributes
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');

    // Find and label the close button
    const closeButton = modal.querySelector('button[aria-label="Close"], .close-button') as HTMLElement;
    if (closeButton && !closeButton.getAttribute('aria-label')) {
      closeButton.setAttribute('aria-label', ARIA_LABELS.CLOSE_BUTTON);
    }

    // Trap focus within the modal
    const cleanup = FocusManager.trapFocus(modal);

    // Prevent background scroll
    document.body.style.overflow = 'hidden';

    return () => {
      cleanup();
      document.body.style.overflow = '';
    };
  }
}

// Progress and loading states
export class LoadingAccessibility {
  static announceLoading(message: string): void {
    ScreenReader.announceLoading(message);
  }

  static announceLoaded(message: string): void {
    ScreenReader.announceSuccess(message);
  }

  static setLoadingState(element: HTMLElement, loading: boolean): void {
    if (loading) {
      element.setAttribute('aria-busy', 'true');
      element.setAttribute('aria-live', 'polite');
    } else {
      element.setAttribute('aria-busy', 'false');
      element.removeAttribute('aria-live');
    }
  }
}

// High contrast mode detection
export class HighContrastMode {
  static isEnabled(): boolean {
    // Check for high contrast mode
    const testElement = document.createElement('div');
    testElement.style.color = 'rgb(31, 41, 55)'; // Tailwind gray-800
    testElement.style.backgroundColor = 'rgb(255, 255, 255)';
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const isHighContrast = computedStyle.color === computedStyle.backgroundColor;

    document.body.removeChild(testElement);
    return isHighContrast;
  }

  static watchForChanges(callback: (enabled: boolean) => void): () => void {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    callback(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }
}

// Reduced motion preference
export class ReducedMotion {
  static isEnabled(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  static watchForChanges(callback: (enabled: boolean) => void): () => void {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    callback(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => callback(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }
}