# Administration Routes - I18N Keys

This document lists all internationalization (i18n) keys that should be implemented for the administration-routes module.

## Error Messages

### Not Found Errors
- `errors.administration_route_not_found` - "Administration route not found"
- `errors.administration_route_not_found_by_code` - "Administration route with code '{code}' not found"
- `errors.administration_route_not_found_by_id` - "Administration route with ID '{id}' not found"

### Conflict Errors
- `errors.administration_route_code_duplicate` - "An administration route with this code already exists"
- `errors.administration_route_version_conflict` - "The administration route has been modified by another user. Please refresh and try again."
- `errors.administration_route_in_use` - "Cannot delete: route is in use by {count} treatment(s) and therapeutic indication(s)"
- `errors.administration_route_not_deleted` - "Administration route is not deleted and cannot be restored"

### Validation Errors
- `validation.code_required` - "Code is required"
- `validation.code_format_invalid` - "Code must contain only lowercase letters and underscores"
- `validation.name_fr_required` - "French name is required"
- `validation.name_en_required` - "English name is required"
- `validation.name_ar_required` - "Arabic name is required"
- `validation.abbreviation_max_length` - "Abbreviation must not exceed 10 characters"
- `validation.display_order_min` - "Display order must be at least 0"

## Success Messages

- `success.administration_route_created` - "Administration route created successfully"
- `success.administration_route_updated` - "Administration route updated successfully"
- `success.administration_route_deleted` - "Administration route deleted successfully"
- `success.administration_route_restored` - "Administration route restored successfully"
- `success.administration_route_toggled` - "Active status updated successfully"

## Total Keys: 18

**Note**: These keys should be added to the i18n translation files (`fr.json`, `en.json`, `ar.json`) once the i18n system is implemented.
