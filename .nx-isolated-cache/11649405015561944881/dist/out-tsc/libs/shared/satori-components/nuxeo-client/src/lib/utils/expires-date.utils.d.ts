/**
 * Validate the date parsed by the field's active adapter, without a second date parser.
 * Non-empty text needs a valid Date: Material turns a failed parse into a null model,
 * which must not be mistaken for an intentional clear or allowed through a save guard.
 */
export declare function isExpiresFieldValid(expiresRawText: string, expires: Date | null): boolean;
/** Whether to show the Expires validation message (non-empty invalid input). */
export declare function shouldShowExpiresFieldError(expiresRawText: string, expires: Date | null): boolean;
/** Shows Expires validation errors immediately on input (not only after blur). */
export declare function createExpiresErrorStateMatcher(isInvalid: () => boolean): {
    isErrorState: () => boolean;
};
//# sourceMappingURL=expires-date.utils.d.ts.map