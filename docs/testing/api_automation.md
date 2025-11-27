---
id: api-automation-testing-documentation
title: API Automation Testing – Documentation
sidebar_position: 4
---

## 1. Overview

This document describes how to perform automated API testing to validate the functionality, performance, and reliability of the system’s APIs.
It covers:

- Environment setup
- Test structure
- How to run automated tests
- How to interpret results
- Best practices

Tools used in this guide:

- Postman (Primary tool)
  - You can use postman cli

download postman in your system from https://www.postman.com/downloads/

Alternatively, you can use:

- Newman (Postman CLI runner)
- Postman CLI

---

## 2. Environment Setup Example

| Variable Name     | Description                       | Example Value                    |
| ----------------- | --------------------------------- | -------------------------------- |
| P1_API_DEV        | Base URL for the API              | https://api.dev.prosperna.com/v1 |
| STORE_ID          | Identifier for the store          | 68d0dce7ac76e887f8a950a6         |
| STORE_LOCATION_ID | Identifier for the store location | 68d0dce7ac76e887f8a950a7         |

---

## 3. Test Structure (Example)

Organize your Postman collections and folders based on the API Services and Endpoints being tested.
For example:

```bash
Automation Tests/
└── Order Service/
    └── Type of Delivery (JNT, LALAMOVE, Store Pickup, etc)/
        └── Type of payment (COD, Online Payment, etc)/
            ├── Prerequisites/
            ├── Computation/
            ├── Create Order/
            ├── Payment (if Online Payment)/
            ├── Book a rider/
            └── Order Update/
```

---

## 4. Running a Collection for Testing

To run a collection in Postman, hover your mouse over the collection you want to execute, click the three dots icon, and select Run.

There are two ways to run a collection in Postman:

- Run manually using the Collection Runner
- Run automatically using the CLI (Command Line Interface)

### 4.1 Run Manually Using the “Collection Runner”

1. After clicking the Run button, a new window called Collection Runner will open.
2. Click the Run "Collection Name" button to start executing the test cases.

### 4.2 Run Using Automated CLI Execution

1. Click Automate run via CLI in Postman.
   - Instructions and a command will be displayed.
2. Copy the generated command.
3. Open your Terminal or Command Prompt.
4. Paste the command into the terminal and press Enter to start the automated run.

---

## 5. Interpreting Test Results

| Metric             | Description                              |
| ------------------ | ---------------------------------------- |
| Json Response      | The actual data returned by the API      |
| Response Time      | How fast the API responds                |
| Status Code        | HTTP response code (200, 400, 500, etc.) |
| Assertion Failures | Test logic failures                      |
| Error Messages     | Useful for debugging                     |

---

## 6. Happy Path and Negative Path Testing

To ensure the API behaves correctly under normal and error conditions, each endpoint must be tested using both Happy Path and Negative Path scenarios.

### 6.1 Happy Path Testing

Happy Path tests validate that the API works as expected when valid inputs are provided.

Characteristics:

- Correct request payload
- Valid authentication tokens
- All required fields are present
- Proper data types are used

What to validate:

- Status code is 200 or 201
- Response body contains expected properties
- Business logic is executed correctly

#### Code Example for Happy Path Testing

```js
pm.test("Status code is 200 or 201", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response is valid JSON", function () {
  pm.response.to.be.json;
});

pm.test("Response has expected main keys", function () {
  pm.expect(jsonData).to.have.keys(["data", "message", "statusCode"]);
});

const responseTimeLimit = Number(pm.environment.get("POST_RESPONSE_TIME"));

pm.test(`Response time should be <= ${responseTimeLimit} ms`, function () {
  pm.expect(pm.response.responseTime).to.be.below(responseTimeLimit);
});
```

### 6.2 Negative Path Testing

Negative Path tests ensure the API handles invalid or unexpected inputs correctly.

Common scenarios:

- Missing required fields
- Invalid data formats
- Unauthorized requests

What to validate:

- Status code is not 200
- Proper error message is returned
- No unintended database changes occur

#### Code Example for Negative Path Testing

```js
let jsonData;
const status = pm.response.code;

pm.test("Response is JSON", function () {
  pm.expect(pm.response.headers.get("Content-Type")).to.include(
    "application/json",
  );
});

try {
  jsonData = pm.response.json();
} catch (e) {
  pm.test("Response should be valid JSON", function () {
    throw new Error("Response body is not valid JSON");
  });
  return;
}

// Negative Path assertions
pm.test("Status code is 4xx or 5xx", function () {
  pm.expect(status).to.be.within(400, 599);
});

pm.test("Response contains error message", function () {
  pm.expect(jsonData).to.have.any.keys("error", "errors", "message");
});

const responseTimeLimit = Number(pm.environment.get("GET_RESPONSE_TIME"));

pm.test(`Response time should be <= ${responseTimeLimit} ms`, function () {
  pm.expect(pm.response.responseTime).to.be.below(responseTimeLimit);
});
```
