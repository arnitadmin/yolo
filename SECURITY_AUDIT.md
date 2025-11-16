# Admin Authorization Security Hardening

## ✅ Completed Security Fixes

### 1. Role Storage Migration
- **Before**: Admin role stored in `publicMetadata` (client-accessible)
- **After**: Admin role stored in `privateMetadata` (server-only)
- **Impact**: Admin roles are now completely hidden from client-side access

### 2. Metadata Exposure Removed
- **Before**: `/api/user/role` endpoint exposed entire `publicMetadata` object
- **After**: Only returns minimal necessary information (role, isAdmin, email)
- **Impact**: No sensitive metadata is sent to clients

### 3. Audit Logging Implemented
- **Location**: `src/lib/audit.ts`
- **Features**:
  - Logs all admin actions with timestamp, userId, action type, details
  - Captures IP address and user agent for security tracking
  - Console logging (ready for production logging service integration)

### 4. Server-Side Role Verification
- All admin endpoints now verify role server-side on every request
- `requireAdmin()` function enhanced with audit logging
- Request object passed through for IP/user agent tracking

## 🔐 Security Improvements

### Attack Surface Reduced
1. ❌ **Eliminated**: Client-side role inspection via DevTools
2. ❌ **Eliminated**: JWT token role disclosure
3. ❌ **Eliminated**: Metadata exposure via API endpoints
4. ✅ **Added**: Comprehensive audit trail for all admin actions

### Admin Actions Logged
- `admin_access` - When admin accesses protected resources
- `application_create` - Creating new applications
- `application_update` - Updating applications
- `application_delete` - Deleting applications
- `application_reorder` - Reordering applications
- `category_create` - Creating categories
- `category_update` - Updating categories
- `category_delete` - Deleting categories

## 📝 Usage Guide

### Setting Admin Role
```bash
# Run the updated script to set admin role in privateMetadata
pnpm tsx src/scripts/set-admin.ts user@example.com
```

### Viewing Audit Logs
Currently logs to console with `[AUDIT]` prefix:
```json
[AUDIT] {
  "timestamp": "2025-11-16T10:30:00.000Z",
  "userId": "user_abc123",
  "action": "application_create",
  "details": {
    "applicationId": "123",
    "name": "New App",
    "category": "Productivity"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

### Production Integration
To integrate with production logging services, update `src/lib/audit.ts`:

```typescript
// Example: Send to Datadog
await fetch('https://http-intake.logs.datadoghq.com/v1/input', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'DD-API-KEY': process.env.DATADOG_API_KEY!
  },
  body: JSON.stringify(logEntry)
});

// Example: Save to database
await db.auditLog.create({
  data: {
    timestamp: logEntry.timestamp,
    userId: logEntry.userId,
    action: logEntry.action,
    details: logEntry.details,
    ipAddress: logEntry.ipAddress,
    userAgent: logEntry.userAgent
  }
});
```

## 🚨 Important Notes

### Existing Admin Users
If you have existing admin users with roles in `publicMetadata`, you need to:
1. Run the `set-admin.ts` script again for each admin user
2. This will migrate their role to `privateMetadata`
3. Old `publicMetadata` roles will be ignored

### Testing
After deployment, verify:
1. ✅ Admin users can still access `/admin` page
2. ✅ Admin actions work correctly (create/edit/delete)
3. ✅ Audit logs appear in console
4. ✅ Non-admin users cannot access admin endpoints
5. ✅ Role is NOT visible in browser DevTools or network requests

### Monitoring
Watch for these log patterns:
- `[AUDIT]` - All admin actions
- `requireAdmin - admin:` - Admin access checks (dev mode only)
- Failed admin access attempts will throw "Forbidden: Admin access required"

## 🔄 Migration Checklist

- [x] Update `set-admin.ts` to use `privateMetadata`
- [x] Update `auth.ts` to read from `privateMetadata`
- [x] Create audit logging utility (`audit.ts`)
- [x] Update `requireAdmin()` to log access
- [x] Remove metadata exposure from `/api/user/role`
- [x] Add audit logging to all application endpoints
- [x] Add audit logging to all category endpoints
- [x] Verify no `publicMetadata` references remain
- [ ] Re-run `set-admin.ts` for existing admin users
- [ ] Test admin access in production
- [ ] Configure production logging service (optional)

