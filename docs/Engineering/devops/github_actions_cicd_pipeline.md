---

id: github-actions-cicd-pipeline
title: GitHub Actions CI/CD Pipeline
sidebar_label: "GitHub Actions CI/CD Pipeline"

---

At Prosperna, we use GitHub Actions to automate our Continuous Integration and Continuous Deployment (CI/CD) pipelines. This ensures that our code is consistently built, tested, and deployed to our three main environments: development, staging, and production. Each environment is tied to a corresponding branch in our GitHub repositories: `dev`, `staging`, and `main`.

Our approach to CI/CD is designed for microservices deployed on Amazon ECS (Elastic Container Service). The following documentation details the workflows we use for our development environment, which serves as a testing ground before code is promoted to staging and production.

## The BODA Philosophy

We're in the process of rolling out a new CI/CD philosophy we call **BODA**, which stands for **"Build Once, Deploy Anywhere"**.

Currently, we build separate Docker images for each environment. However, with BODA, we will build a single Docker image in the dev environment. This exact same, pre-tested image will then be promoted through the staging and main branches, and eventually into production. This practice ensures that the exact same software artifact that was thoroughly tested in the development environment is the one that gets deployed to production, eliminating potential discrepancies and making our deployments more reliable.

---

## Frontend CI/CD Pipeline (`P1-dev-action.yml`)

The frontend CI/CD pipeline for the `dev` branch automates a series of checks and deployment steps every time code is pushed to the `dev` branch.

### Workflow Breakdown

- **lint-test**: Runs a linter to catch style guide violations and programming bugs.
- **dependency-check**: Checks for outdated npm dependencies and open Dependabot PRs.
- **vulnerability-check**: Runs `npm audit` to detect known security vulnerabilities.
- **sasts-scan**: Placeholder for future Static Application Security Testing (SAST).
- **upload-s3-assets**: Syncs local `src/assets` to Amazon S3.
- **code-review**: Placeholder for an automated code review tool.
- **unit-test**: Runs unit tests and sends results to ClickUp.
- **api-test**: Placeholder to test frontend-backend API integration.
- **integration-test**: Placeholder to verify system component interactions.
- **build**: Builds and pushes the Docker image to ECR.
- **artifact**: Placeholder for uploading build artifacts to S3.
- **deploy**: Updates the ECS task definition and deploys the new version.
- **e2e-testing**: Triggers end-to-end (E2E) tests via HyperExecute.

```yaml
name: P1 - FEND Development CI/CD
on:
  workflow_dispatch:
  push:
    branches: ["dev"]
    paths-ignore:
      - '**.md'
      - '.terraform/**'
jobs:
  lint-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          registry-url: 'https://npm.pkg.github.com/'
      - name: Install Dependencies
        run: npm install -f
      - name: Run Linter
        run: |
          npm run lint 2>&1 | tee lint_error.log || true

          if grep -q "error" lint_error.log; then
            echo "❌ Linting errors detected!"
            cat lint_error.log
            exit 1
          else
            echo "✅ No linting errors detected."
          fi
  dependency-check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          registry-url: 'https://npm.pkg.github.com/'
      - name: Install Dependencies
        run: npm install -f
      - name: Check Outdated Dependencies
        run: |
          npm outdated --parseable | awk -F: '$5 == "major" || $5 == "minor" { print $0 }' | tee dependency_error.log
          if [ -s dependency_error.log ]; then
            echo "❌ Major/Minor outdated dependencies found!"
            exit 1
          else
            echo "✅ No major/minor outdated dependencies."
          fi
      - name: Check for open Dependabot PRs
        run: |
          DEPENDABOT_PR_COUNT=$(gh pr list --author "dependabot[bot]" --state open --base dev --json number --jq 'length')
          if [ "$DEPENDABOT_PR_COUNT" -gt 0 ]; then
            echo "❌ There are open Dependabot PRs that need review!"
            exit 1
          else
            echo "✅ No pending Dependabot PRs."
          fi
        env:
          GH_TOKEN: ${{ secrets.NODE_AUTH_TOKEN }}
  vulnerability-check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          registry-url: 'https://npm.pkg.github.com/'
      - name: Install Dependencies
        run: npm install -f
      - name: Audit Dependencies
        run: |
          npm audit --audit-level=high --json > package_error.json || true
          COUNT=$(jq '[.metadata.vulnerabilities.high, .metadata.vulnerabilities.critical] | add' package_error.json || echo 0)

          if [ "$COUNT" -gt 0 ]; then
              echo "❌ High or Critical vulnerabilities found: $COUNT"
              cat package_error.json | tee package_error.log
              exit 1
          else
              echo "✅ No high or critical vulnerabilities found."
          fi
  sasts-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Run SAST Scan
        run: echo "SAST Scan Successful - Placeholder"
  upload-s3-assets:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 100
      - name: Upload Assets to S3 p1-mediaserver
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_REGION }}
        run: |
          aws s3 sync ./src/assets s3://p1-mediaserver/assets
  code-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Run Automated Code Review
        run: echo "Code Review Successful - Placeholder"
  unit-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20.x]
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 100
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          registry-url: 'https://npm.pkg.github.com/'
      - name: Install Dependencies
        run: npm install -f
      - name: Run Unit Tests
        env:
          latest_commit_before_push: >-
            ${{ 
              github.event.before ||
              github.event_name == 'workflow_dispatch' && github.sha ||
              '❌ commit sha is unset. received unhandled edge case'
            }}
        run: |
          : "${latest_commit_before_push:?💥}"
          # check for failing test cases only. ignore coverage threshold.
          npx vitest run \
            --coverage \
            --no-color
          
          npm run test:coverage -- --changed="$latest_commit_before_push" 2>&1 | tee 'test_results.log'
      - name: Send Test Results to ClickUp
        uses: Prosperna/action-clickup-test-result@main
        with:
          clickup_api_key: ${{ secrets.CLICKUP_API_KEY }}
          clickup_chat_url: ${{ secrets.CLICKUP_CHAT_URL }}
        continue-on-error: true
  # API Test
  api-test:
    runs-on: ubuntu-latest
    needs: [lint-test, dependency-check, vulnerability-check, sasts-scan, code-review, unit-test, upload-s3-assets]
    steps:
      - name: Run API Tests
        run: echo "API Tests Successful - Placeholder"
  integration-test:
    runs-on: ubuntu-latest
    needs: [lint-test, dependency-check, vulnerability-check, sasts-scan, code-review, unit-test, upload-s3-assets]
    steps:
      - name: Run Integration Tests
        run: echo "Integration Tests Successful - Placeholder"
  build:
    runs-on: ubuntu-latest
    needs: [api-test, integration-test]
    outputs:
      image: ${{ steps.push-image.outputs.image }}
    strategy:
      matrix:
        node-version: [20.x]
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 100
      - name: Retrieve env file from AWS Secret Manager
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_REGION }}
        run: |
          aws secretsmanager get-secret-value --secret-id ${{ secrets.SECRET_DEV_ENV }} --query SecretString --output text > .env
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      - name: Build & tag docker image
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: prodev-image
          IMAGE_TAG: build-${{ github.sha }}
        run: |
          docker build --build-arg NPM_TOKEN=${{ secrets.NPM_TOKEN }} -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG --target main . 2>&1 | tee build.log
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
      - name: Push image to Amazon ECR
        id: push-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: prodev-image
          IMAGE_TAG: build-${{ github.sha }}
        run: |
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
      - name: Debug image output
        run: echo "Pushed Image - ${{ steps.push-image.outputs.image }}"
  artifact:
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - name: Run Upload Artifact to AWS s3
        run: echo "Upload to S3 has been successful - Placeholder"
  deploy:
    runs-on: ubuntu-latest
    needs: [build, artifact]
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 100
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      - name: Retrieve latest image from ECR
        id: get-latest-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: prodev-image
          IMAGE_TAG: build-${{ github.sha }}
        run: |
          IMAGE_URI=$(aws ecr describe-images \
            --repository-name $ECR_REPOSITORY \
            --query "sort_by(imageDetails[?imageTags != null], &imagePushedAt)[?contains(imageTags, '$IMAGE_TAG')].imageTags" \
            --output text | awk '{print $1}')

          if [[ -z "$IMAGE_URI" ]]; then
            echo "❌ No image found in ECR with tag: $IMAGE_TAG"
            echo "🔍 Listing all images in ECR..."
            aws ecr list-images --repository-name $ECR_REPOSITORY --query "imageIds[*].imageTag" --output table
            exit 1
          fi

          FULL_IMAGE_URI="$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_URI"
          echo "Using image: $FULL_IMAGE_URI"
          echo "image=$FULL_IMAGE_URI" >> $GITHUB_ENV
      - name: Download task definition
        run: aws ecs describe-task-definition --task-definition prodev-task --query taskDefinition > task-definition.json
      - name: Render Amazon ECS task definition for Nginx Reverse Proxy container
        id: render-web-container
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: nginx-fend
          image: ${{ env.image }}
      - name: Deploy Amazon ECS task definition
        id: deploy-task-def
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.render-web-container.outputs.task-definition }}
          service: P1-Dev-Service
          cluster: P1-Dev
  e2e-testing:
    runs-on: ubuntu-latest
    needs: [deploy]
    steps:
      - name: Trigger Specific Test Run via HyperExecute
        id: trigger-test
        run: |
          echo "🚀 Triggering HyperExecute job for a specific test run..."

          TEST_RUN_ID="${{ secrets.LT_TEST_RUN_ID }}"
          if [[ -z "$TEST_RUN_ID" ]]; then
            echo "❌ Test Run ID not found. Please add 'LT_TEST_RUN_ID' to your GitHub secrets."
            exit 1
          fi

          response=$(curl --silent --location --fail 'https://test-manager-api.lambdatest.com/api/atm/v1/hyperexecute' \
            --header 'accept: application/json' \
            --header 'Content-Type: application/json' \
            --header "Authorization: Basic ${{ secrets.LT_ACCESS }}" \
            --data "{\"test_run_id\": \"$TEST_RUN_ID\", \"concurrency\": 2}")

          echo "🔍 Response: $response"

          job_id=$(echo "$response" | jq -r '.job_id')

          if [[ -z "$job_id" || "$job_id" == "null" ]]; then
            echo "❌ Failed to retrieve job ID."
            exit 1
          fi

          echo "✅ Triggered Job ID: $job_id"
          echo "::set-output name=job_id::$job_id"
```

---

## Backend CI/CD Pipeline (`orders-dev-action.yml`)

The backend CI/CD pipeline for the `dev` branch is similar to the frontend but tailored for our microservices. This example is for the **Orders** service.

### Workflow Breakdown

- **lint-test**: Static code analysis for coding standards and errors.
- **dependency-check**: Detects outdated dependencies and major version changes.
- **vulnerability-check**: Runs `npm audit` to detect high and critical issues.
- **sasts-scan**: Placeholder for future SAST implementation.
- **code-review**: Placeholder for automated code review.
- **unit-test**: Executes backend unit tests and sends results to ClickUp.
- **api-test**: Placeholder for validating backend endpoints.
- **integration-test**: Placeholder for testing service integration.
- **build**: Builds and tags Docker image with SHA and `dev-lts`, pushes to ECR.
- **artifact**: Placeholder for uploading build artifacts to S3.
- **deploy**: Retrieves latest image, updates ECS task definition with Datadog version tagging, and deploys the updated task to ECS.

```yaml
name: Order Service API Development CI/CD
on:
  workflow_dispatch:
  push:
    branches: ['dev']
    paths-ignore:
      - '**.md'
jobs:
  lint-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22.x]
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          registry-url: 'https://npm.pkg.github.com/'
      - name: Install Dependencies
        run: npm install
      - name: Run Linter
        run: |
          npm run lint 2>&1 | tee lint_error.log || true

          if grep -q "error" lint_error.log; then
            echo "❌ Linting errors detected!"
            cat lint_error.log
            exit 1
          else
            echo "✅ No linting errors detected."
          fi
  dependency-check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22.x]
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          registry-url: 'https://npm.pkg.github.com/'
      - name: Install Dependencies
        run: npm install
      - name: Check Outdated Dependencies
        run: |
          npm outdated --parseable | awk -F: '$5 == "major" { print $0 }' | tee dependency_error.log
          if [ -s dependency_error.log ]; then
            echo "❌ Major outdated dependencies found!"
            exit 1
          else
            echo "✅ No major outdated dependencies."
          fi
  vulnerability-check:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22.x]
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          registry-url: 'https://npm.pkg.github.com/'
      - name: Install Dependencies
        run: npm install
      - name: Audit Dependencies
        run: |
          npm audit --audit-level=high --json > package_error.json || true
          COUNT=$(jq '[.metadata.vulnerabilities.high, .metadata.vulnerabilities.critical] | add' package_error.json || echo 0)

          if [ "$COUNT" -gt 0 ]; then
              echo "❌ High or Critical vulnerabilities found: $COUNT"
              cat package_error.json | tee package_error.log
              exit 1
          else
              echo "✅ No high or critical vulnerabilities found."
          fi
  sasts-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Run SAST Scan
        run: echo "SAST Scan Successful - Placeholder"
  code-review:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Run Automated Code Review
        run: echo "Code Review Successful - Placeholder"
  unit-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22.x]
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 100
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          registry-url: 'https://npm.pkg.github.com/'
      - name: Install Dependencies
        run: npm install
      - name: Cache Build
        uses: actions/cache@v4
        id: cache-build
        with:
          path: ./*
          key: cachev1-${{ github.sha }}
      - name: Run Unit Tests
        env:
          latest_commit_before_push: >-
            ${{ 
              github.event.before ||
              github.event_name == 'workflow_dispatch' && github.sha ||
              '❌ commit sha is unset. received unhandled edge case'
            }}
        run: |
          : "${latest_commit_before_push:?💥}"
          # check for failing test cases only. ignore coverage threshold.
          npm run test || { printf "test suite has failing test cases\n"; exit 1; }
          npm run test:coverage
          npm run test:coverage -- --changedSince="$latest_commit_before_push" --ci 2>&1 | tee 'test_results.log'
      - name: Send Test Results to ClickUp
        uses: Prosperna/action-clickup-test-result@main
        with:
          clickup_api_key: ${{ secrets.CLICKUP_API_KEY }}
          clickup_chat_url: ${{ secrets.CLICKUP_CHAT_URL }}
  api-test:
    runs-on: ubuntu-latest
    needs: [lint-test, dependency-check, vulnerability-check, sasts-scan, code-review, unit-test]
    steps:
      - name: Run API Tests
        run: echo "API Tests Successful - Placeholder"
  integration-test:
    runs-on: ubuntu-latest
    needs: [lint-test, dependency-check, vulnerability-check, sasts-scan, code-review, unit-test]
    steps:
      - name: Run Integration Tests
        run: echo "Integration Tests Successful - Placeholder"
  build:
    runs-on: ubuntu-latest
    needs: [api-test, integration-test]
    outputs:
      image: ${{ steps.push-image.outputs.image }}
    strategy:
      matrix:
        node-version: [22.x]
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 100
      - name: Retrieve env file from AWS Secret Manager
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_REGION }}
        run: |
          aws secretsmanager get-secret-value --secret-id ${{ secrets.SECRET_ENV }} --query SecretString --output text > .env.development
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      - name: Build & tag docker image
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: orders-api
          IMAGE_TAG: dev-${{ github.sha }}
        run: |
          docker build --build-arg NPM_TOKEN=${{ secrets.NPM_TOKEN }} \
                        --build-arg DD_GIT_REPOSITORY_URL=$(git config --get remote.origin.url) \
                        --build-arg DD_GIT_COMMIT_SHA=$(git rev-parse HEAD) \
                        -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG . 2>&1 | tee build.log
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:dev-lts
      - name: Push image to Amazon ECR
        id: push-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: orders-api
          IMAGE_TAG: dev-${{ github.sha }}
        run: |
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:dev-lts
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
      - name: Debug image output
        run: echo "Pushed Image - ${{ steps.push-image.outputs.image }}"
  artifact:
    runs-on: ubuntu-latest
    needs: [build]
    steps:
      - name: Run Upload Artifact to AWS s3
        run: echo "Upload to S3 has been successful - Placeholder"
  deploy:
    runs-on: ubuntu-latest
    needs: [build, artifact]
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 100
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      - name: Retrieve latest image from ECR
        id: get-latest-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: orders-api
          IMAGE_TAG: dev-${{ github.sha }}
        run: |
          IMAGE_URI=$(aws ecr describe-images \
            --repository-name "$ECR_REPOSITORY" \
            --query "sort_by(imageDetails[?imageTags!=null && contains(imageTags, \`$IMAGE_TAG\`)], &imagePushedAt)[-1].imageTags[0]" \
            --output text)

          if [[ -z "$IMAGE_URI" ]]; then
            echo "❌ No image found in ECR with tag: $IMAGE_TAG"
            exit 1
          fi

          FULL_IMAGE_URI="$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_URI"
          echo "Using image: $FULL_IMAGE_URI"
          echo "image=$FULL_IMAGE_URI" >> $GITHUB_ENV
      - name: Download ECS task definition
        run: aws ecs describe-task-definition --task-definition p1-micro-orders-dev-td --query taskDefinition > task-definition.json
      - name: Update DD_VERSION and Docker labels in task definition
        run: |
          COMMIT_SHA=${{ github.sha }}
          jq --arg IMAGE "$IMAGE" --arg COMMIT_SHA "$COMMIT_SHA" '
            .containerDefinitions[0].image = $IMAGE |
            .containerDefinitions[0].environment |= map(if .name == "DD_VERSION" then .value = $COMMIT_SHA else . end) |
            .containerDefinitions[0].dockerLabels["com.datadoghq.tags.version"] = "dev-\($COMMIT_SHA)"
          ' task-definition.json > updated-task-definition.json
          mv updated-task-definition.json task-definition.json
      - name: Render Amazon ECS task definition for Orders API Container
        id: update-task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: orders-api
          image: ${{ env.image }}
      - name: Deploy Amazon ECS task definition
        id: deploy-task-def
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: ${{ steps.update-task-def.outputs.task-definition }}
          service: orders-dev-srv
          cluster: P1-Micro-Dev-Cluster
```

---

> ✅ **Note:** Both pipelines include future integrations for security scanning, artifact storage, and advanced testing. These are marked as placeholders and will be progressively implemented.

---

## Summary

Prosperna's GitHub Actions CI/CD pipelines aim to streamline the entire development and deployment lifecycle across our frontend and backend microservices. By enforcing checks at every stage—from linting to deployment—we ensure high-quality, secure, and consistent delivery of features across all environments.

---

## 🔗 Related Links

- [📄 ECS Cluster & Service Deployment Guide](https://pkb.prosperna.ph/docs/Engineering/devops/ecs-cluster)
- [📄 Microservice Deployment Guidelines](https://pkb.prosperna.ph/docs/Engineering/devops/microservice-deployment-guidelines)

