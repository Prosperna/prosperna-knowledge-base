---
id: cognito-setup
title: Cognito Setup and Access
sidebar_label: Cognito Setup and Access
---

# Cognito Setup and Access

## What is AWS Cognito?

Amazon Cognito is a user identity and authentication service provided by AWS. It allows developers to add sign-up, sign-in, and access control to web and mobile apps quickly and securely. Cognito manages user pools and federated identities, integrates with other AWS services, and supports multi-factor authentication, OAuth, SAML, and more.

### Benefits for Organizations

- **Secure User Authentication**: Provides token-based authentication via OAuth2/OpenID Connect.
- **Scalability**: Easily handles thousands of users across environments.
- **Federated Identities**: Supports third-party identity providers (Google, Facebook, SAML, etc.).
- **Integration with AWS Services**: Seamlessly integrates with API Gateway, Lambda, S3, etc.
- **User Management**: Enables account recovery, email/phone verification, MFA, and custom user attributes.

---

## Cognito User Pools in Prosperna

### a. `P1-Developers` (Pre-login Developer Access)

- **User pool ID**: `ap-southeast-1_XOwSz7e6q`
- **ARN**: `arn:aws:cognito-idp:ap-southeast-1:358132463944:userpool/ap-southeast-1_XOwSz7e6q`
- **Token signing key**: [JWKS](https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_XOwSz7e6q/.well-known/jwks.json)
- **Estimated Users**: 1
- **Feature Plan**: Lite

### b. `prosperna1-users` (Production)

- **User pool ID**: `ap-southeast-1_xp1SKQIYj`
- **ARN**: `arn:aws:cognito-idp:ap-southeast-1:358132463944:userpool/ap-southeast-1_xp1SKQIYj`
- **Token signing key**: [JWKS](https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_xp1SKQIYj/.well-known/jwks.json)
- **Estimated Users**: 9196
- **Feature Plan**: Lite

### c. `prosperna1-users-dev` (Development)

- **User pool ID**: `ap-southeast-1_S4TWIFMQh`
- **ARN**: `arn:aws:cognito-idp:ap-southeast-1:358132463944:userpool/ap-southeast-1_S4TWIFMQh`
- **Token signing key**: [JWKS](https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_S4TWIFMQh/.well-known/jwks.json)
- **Estimated Users**: 1595
- **Feature Plan**: Lite

### d. `prosperna1-users-staging` (Staging)

- **User pool ID**: `ap-southeast-1_MyTVp7sZN`
- **ARN**: `arn:aws:cognito-idp:ap-southeast-1:358132463944:userpool/ap-southeast-1_MyTVp7sZN`
- **Token signing key**: [JWKS](https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_MyTVp7sZN/.well-known/jwks.json)
- **Estimated Users**: 703
- **Feature Plan**: Lite

---

## Step-by-Step: Creating a New User Pool

1. **Go to AWS Cognito Console**

   - [https://console.aws.amazon.com/cognito/](https://console.aws.amazon.com/cognito/)

2. **Choose 'Manage User Pools'**

3. **Click 'Create user pool'**

4. **Enter Pool Name**

   - Example: `prosperna1-users-uat`

5. **Choose Sign-in Options**

   - Allow username/email/phone (as per app requirements)

6. **Configure Security**

   - Choose password policy, MFA, email verification, etc.

7. **Configure Attributes**

   - Add standard or custom attributes (name, company\_id, etc.)

8. **Create App Clients**

   - No secret for web apps
   - Enable OAuth 2.0 flows if needed

9. **Review and Create Pool**

10. **Save App Client ID** and Pool ID

---

## How to Use User Pool in Web Applications

### 1. **Install AWS Amplify (or use AWS SDK)**

```bash
npm install aws-amplify
```

### 2. **Amplify Configuration**

```ts
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';

Amplify.configure({
  Auth: {
    region: 'ap-southeast-1',
    userPoolId: 'ap-southeast-1_xp1SKQIYj',
    userPoolWebClientId: 'your-app-client-id',
    mandatorySignIn: true,
  }
});
```

### 3. **Sign In Example**

```ts
import { Auth } from 'aws-amplify';

Auth.signIn(username, password)
  .then(user => console.log(user))
  .catch(err => console.error(err));
```

### 4. **Token Verification (Backend)**

Use the token signing key URL from the pool metadata to validate tokens using JWT libraries (e.g., `jsonwebtoken`).

---

## Refresh Token Flow

Cognito uses refresh tokens to maintain user sessions without re-authentication.

- **Access Token**: Short-lived token used for authenticated API requests
- **ID Token**: Contains identity claims
- **Refresh Token**: Long-lived token used to get new Access/ID tokens

```ts
Auth.currentSession()
  .then(session => {
    const accessToken = session.getAccessToken().getJwtToken();
    const idToken = session.getIdToken().getJwtToken();
    const refreshToken = session.getRefreshToken().getToken();
  });
```

---

## Useful Documentation Links

- [Amazon Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [Cognito Auth Flow](https://docs.amplify.aws/lib/auth/start/q/platform/js/)
- [Validating JWTs](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-the-jwt-toolkit.html)
- [Cognito Token Reference](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html)

