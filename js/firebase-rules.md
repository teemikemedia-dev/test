# Teemikemedia Agency Firebase Realtime Database Rules

Use these rules in Firebase Console > Realtime Database > Rules.

The admin login now supports either of these admin approval structures:

```json
{ "admins": { "ADMIN_UID_HERE": true } }
```

or:

```json
{ "admins": { "ADMIN_UID_HERE": { "approved": true } } }
```

Recommended structure: `admins/{uid}/approved: true` because it allows adding admin metadata later.

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "admins": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": false,
        ".validate": "newData.isBoolean() || (newData.hasChild('approved') && newData.child('approved').isBoolean())",
        "approved": {
          ".validate": "newData.isBoolean()"
        },
        "$other": {
          ".validate": "newData.isString() || newData.isNumber() || newData.isBoolean()"
        }
      }
    },
    "clients": {
      "$clientUid": {
        ".read": "auth != null && (auth.uid === $clientUid || root.child('admins').child(auth.uid).val() === true || root.child('admins').child(auth.uid).child('approved').val() === true)",
        ".write": "auth != null && (root.child('admins').child(auth.uid).val() === true || root.child('admins').child(auth.uid).child('approved').val() === true)",
        "account": {
          ".validate": "newData.hasChildren(['name','email'])",
          "name": { ".validate": "newData.isString() && newData.val().length > 1 && newData.val().length <= 120" },
          "email": { ".validate": "newData.isString() && newData.val().length <= 180" },
          "status": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 120)" },
          "$other": { ".validate": true }
        },
        "overview": {
          "projectPhase": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 160)" },
          "progressFocus": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 220)" },
          "nextStep": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 220)" },
          "$other": { ".validate": true }
        },
        "projects": {
          "$projectId": {
            "title": { ".validate": "newData.isString() && newData.val().length > 1 && newData.val().length <= 160" },
            "phase": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 160)" },
            "progress": { ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 100" },
            "summary": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 800)" },
            "$other": { ".validate": true }
          }
        },
        "timeline": {
          "$timelineId": {
            "date": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 80)" },
            "title": { ".validate": "newData.isString() && newData.val().length > 1 && newData.val().length <= 180" },
            "detail": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 900)" },
            "$other": { ".validate": true }
          }
        },
        "support": {
          "title": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 120)" },
          "detail": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 1000)" },
          "label": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 80)" },
          "url": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 500)" },
          "calendlyUrl": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 500)" },
          "zoomUrl": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 700)" },
          "googleMeetUrl": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 500)" },
          "$other": { ".validate": true }
        },
        "assets": {
          "$assetId": {
            "title": { ".validate": "newData.isString() && newData.val().length > 1 && newData.val().length <= 160" },
            "url": { ".validate": "newData.isString() && newData.val().length <= 700" },
            "type": { ".validate": "!newData.exists() || (newData.isString() && newData.val().length <= 80)" },
            "$other": { ".validate": true }
          }
        },
        "internalNotes": {
          "$noteId": {
            ".read": "auth != null && (root.child('admins').child(auth.uid).val() === true || root.child('admins').child(auth.uid).child('approved').val() === true)",
            ".write": "auth != null && (root.child('admins').child(auth.uid).val() === true || root.child('admins').child(auth.uid).child('approved').val() === true)",
            "note": { ".validate": "newData.isString() && newData.val().length > 1 && newData.val().length <= 2000" },
            "$other": { ".validate": true }
          }
        }
      }
    }
  }
}
```
