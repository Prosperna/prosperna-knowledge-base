---
id: variant-combination-management-pt1
title: Variant Combination Management Part 1
sidebar_label: Variant Combinations 1
sidebar_position: 5
---

#### **UC 23 | Auto-Generate Variant Combinations**

| **Field**           | **Description**                                                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 23                                                                                                                                                                           |
| Prepared By         | BA                                                                                                                                                                              |
| Last Updated        | September 16, 2025                                                                                                                                                              |
| Objectives          | The system should automatically create and display all possible variant combinations based on the defined types and options.                                                    |
| Actor               | System                                                                                                                                                                          |
| Preconditions       | The merchant adds, edits, or removes a variant type or option that affects the total number of possible combinations.                                                           |
| Steps               | 1\. A change to the variant configuration is successfully made (e.g., a new option "Large" is added to the "Size" type).                                                        |
|                     | 2\. The system immediately recalculates the complete set of possible variant combinations by finding the Cartesian product of all named options within all named variant types. |
|                     | 3\. The system renders the "Variant Combinations" table, displaying a row for each unique permutation (e.g., "Red / Large", "Blue / Large").                                    |
| Postconditions      | The Variant Combinations table accurately reflects all possible variations of the product.                                                                                      |
| Business Trigger    | The system must provide immediate feedback to the merchant, showing the result of their configuration changes.                                                                  |
| Acceptance Criteria | The number of rows in the combinations table is the correct product of the number of options in each type.                                                                      |
|                     | Each row represents a unique combination of options.                                                                                                                            |
| Estimates           |                                                                                                                                                                                 |
| Success Message     |                                                                                                                                                                                 |
| Error Messages      |                                                                                                                                                                                 |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br />                              |

#### **UC 24 | Auto-Delete Variant Combinations**

| **Field**           | **Description**                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 24                                                                                                                     |
| Prepared By         | BA                                                                                                                        |
| Last Updated        | September 16, 2025                                                                                                        |
| Objectives          | The system should automatically remove variant combinations that are no longer possible due to a change in configuration. |
| Actor               | System                                                                                                                    |
| Preconditions       | The merchant deletes a variant type (e.g., "Color") or a variant option (e.g., "Red").                                    |
| Steps               | 1\. The merchant successfully deletes a variant type or a populated option.                                               |
|                     | 2\. The system recalculates the set of all possible variant combinations.                                                 |
|                     | 3\. Any combination that relied on the deleted component (e.g., any combination that was "Red") is no longer valid.       |
|                     | 4\. The system removes the corresponding rows for these invalid combinations from the "Variant Combinations" table.       |
| Postconditions      | The Variant Combinations table no longer contains rows for combinations that are impossible to make.                      |
| Business Trigger    | The system must maintain data integrity and consistency between the configuration and the resulting combinations.         |
| Acceptance Criteria | All combinations that included the deleted type/option are removed from the table.                                        |
|                     | No other combinations are affected.                                                                                       |
|                     | The unaffected combinations' existing data are retained.                                                                  |
| Estimates           |                                                                                                                           |
| Success Message     |                                                                                                                           |
| Error Messages      |                                                                                                                           |

| **Business Rules/Desired Behavior**                                            |
| ------------------------------------------------------------------------------ |
| <br />This use case should apply on the following scenarios:<br /><br /><br /> |

#### **UC 25 | Preserve Existing Data on Combination Regeneration**

| **Field**           | **Description**                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Use Case ID         | UC 25                                                                                                                                                        |
| Prepared By         | BA                                                                                                                                                           |
| Last Updated        | September 16, 2025                                                                                                                                           |
| Objectives          | The system should maintain saved data for variant combinations that persist through a configuration change.                                                  |
| Actor               | System                                                                                                                                                       |
| Preconditions       | A variant combination (e.g., "Red / Small") has manually entered data (e.g., Price: $19.99, SKU: "TS-R-S").                                                  |
|                     | The merchant makes a change that does not eliminate that combination (e.g., adds a new option "Blue").                                                       |
| Steps               | 1\. The merchant adds a new option ("Blue") to the "Color" variant type.                                                                                     |
|                     | 2\. The system regenerates the list of combinations. The combination "Red / Small" is still valid. A new combination, "Blue / Small", is created.            |
|                     | 3\. When re-rendering the table, the system identifies the persistent "Red / Small" combination.                                                             |
|                     | 4\. The system ensures that the row for "Red / Small" retains all its previously entered data (Price, SKU, Quantity, etc.).                                  |
|                     | 5\. The system renders the new "Blue / Small" row with default/empty values for its fields.                                                                  |
| Postconditions      | Manually entered data for variant combinations that were not deleted is preserved.                                                                           |
| Business Trigger    | To provide a good user experience and prevent data loss, the system should not discard work the merchant has already done on variants that are not changing. |
| Acceptance Criteria | After adding a new option/type, existing data in unaffected combination rows remains unchanged.                                                              |
|                     | New combination rows are created with default values.                                                                                                        |
| Estimates           |                                                                                                                                                              |
| Success Message     |                                                                                                                                                              |
| Error Messages      |                                                                                                                                                              |

| **Business Rules/Desired Behavior**                                                                    |
| ------------------------------------------------------------------------------------------------------ |
| <br />This use case should apply on the following scenarios:<br /><br /><br /><br /><br /><br /><br /> |

#### **UC 26 | Highlight Newly Generated Variant Combinations**

| **Field**           | **Description**                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 26                                                                                                                                       |
| Prepared By         | BA                                                                                                                                          |
| Last Updated        | September 16, 2025                                                                                                                          |
| Objectives          | The system should temporarily highlight newly created variant combination rows to provide visual feedback.                                  |
| Actor               | System                                                                                                                                      |
| Preconditions       | A merchant's action (e.g., adding a new option) results in the creation of new rows in the Variant Combinations table.                      |
| Steps               | 1\. The merchant adds a new option, "Green", to the "Color" type. This generates new combinations like "Green / Small" and "Green / Large". |
|                     | 2\. The system regenerates and renders the combinations table.                                                                              |
|                     | 3\. The system identifies the newly created rows ("Green / Small", "Green / Large").                                                        |
|                     | 4\. The system applies a temporary visual highlight (e.g., a blue background fade) to only these new rows.                                  |
|                     | 5\. The highlight animation plays and fades out over a short duration (e.g., 3 seconds).                                                    |
| Postconditions      | The merchant can easily see which new combinations were just added to the table as a result of their action.                                |
| Business Trigger    | Provide clear, immediate visual feedback to the user about the consequences of their actions.                                               |
| Acceptance Criteria | Only newly created rows are highlighted.                                                                                                    |
|                     | The highlight is temporary and fades out automatically.                                                                                     |
| Estimates           |                                                                                                                                             |
| Success Message     |                                                                                                                                             |
| Error Messages      |                                                                                                                                             |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br />                              |

#### **UC 27 | Search Variant Combinations**

| **Field**           | **Description**                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 27                                                                                                               |
| Prepared By         | BA                                                                                                                  |
| Last Updated        | September 16, 2025                                                                                                  |
| Objectives          | The merchant should be able to filter the variant combinations list to find specific variants.                      |
| Actor               | Merchant, System                                                                                                    |
| Preconditions       | The Variant Combinations table is visible and contains at least one combination.                                    |
| Steps               | 1\. The merchant locates the "Search..." input field above the combinations table.                                  |
|                     | 2\. The merchant types a search term (e.g., "Red") into the field.                                                  |
|                     | 3\. As the merchant types, the system filters the rows in the combinations table in real-time.                      |
|                     | 4\. Only rows where the "Name" field contains the search term are displayed. The search should be case-insensitive. |
|                     | 5\. The merchant deletes the text from the search field.                                                            |
|                     | 6\. The system restores the full, unfiltered list of variant combinations.                                          |
| Postconditions      | The combinations table is filtered to show only variants that match the search criteria.                            |
| Business Trigger    | The merchant needs to quickly find one or more specific variants in a large list to edit their properties.          |
| Acceptance Criteria | The table filters in real-time as the user types.                                                                   |
|                     | The search is case-insensitive.                                                                                     |
|                     | Clearing the search box restores the full list.                                                                     |
| Estimates           |                                                                                                                     |
| Success Message     |                                                                                                                     |
| Error Messages      |                                                                                                                     |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br />                              |

#### **UC 28 | Bulk-Select Variant Combinations**

| **Field**           | **Description**                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 28                                                                                                |
| Prepared By         | BA                                                                                                   |
| Last Updated        | September 16, 2025                                                                                   |
| Objectives          | The merchant should be able to select multiple or all variant combinations to perform a bulk action. |
| Actor               | Merchant, System                                                                                     |
| Preconditions       | The Variant Combinations table is populated with one or more variants.                               |
| Steps               | **Condition 1: Selecting all variants**                                                              |
|                     | 1\. The merchant clicks the master checkbox located in the header of the combinations table.         |
|                     | 2\. The system places a check in the checkbox of every row currently displayed in the table.         |
|                     | 3\. The "Bulk Edit (X)" button appears or updates its count to match the total number of variants.   |
|                     | 4\. The merchant clicks the master checkbox again; the system deselects all rows.                    |
|                     | **Condition 2: Selecting individual variants**                                                       |
|                     | 1\. The merchant clicks the checkbox on a single, unselected row.                                    |
|                     | 2\. The system selects that row.                                                                     |
|                     | 3\. The "Bulk Edit (X)" button appears or updates its count.                                         |
|                     | 4\. The merchant clicks the checkbox on another row; the selection is added and the count updates.   |
| Postconditions      | The merchant has a selection of one or more variant combinations.                                    |
|                     | The UI indicates how many items are currently selected.                                              |
| Business Trigger    | The merchant needs to apply the same change to multiple variants at once, improving efficiency.      |
| Acceptance Criteria | Clicking the header checkbox selects/deselects all visible rows.                                     |
|                     | Clicking a row checkbox selects/deselects only that row.                                             |
|                     | The "Bulk Edit" button appears and correctly displays the number of selected items.                  |
| Estimates           |                                                                                                      |
| Success Message     |                                                                                                      |
| Error Messages      |                                                                                                      |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br />                              |

#### **UC 29 | Edit Variant Combination Name**

| **Field**           | **Description**                                                                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 29                                                                                                                                                            |
| Prepared By         | BA                                                                                                                                                               |
| Last Updated        | September 16, 2025                                                                                                                                               |
| Objectives          | The merchant should be able to edit the name of an individual variant combination.                                                                               |
| Actor               | Merchant, System                                                                                                                                                 |
| Preconditions       | A variant combination row exists in the table.                                                                                                                   |
| Steps               | 1\. The merchant locates the desired variant combination row in the table.                                                                                       |
|                     | 2\. The merchant clicks into the "Name" input field for that row.                                                                                                |
|                     | 3\. The merchant types a new name.                                                                                                                               |
|                     | 4\. The system performs real-time validation for uniqueness against other combination names (as per UC 48). If the name is a duplicate, an inline error appears. |
|                     | 5\. The change is persisted in the UI, ready to be saved.                                                                                                        |
| Postconditions      | The variant combination has a new name in the page's state.                                                                                                      |
| Business Trigger    | The merchant wants to override the auto-generated name for a variant to be more descriptive or SEO-friendly.                                                     |
| Acceptance Criteria | The name field is editable.                                                                                                                                      |
|                     | Uniqueness validation is triggered on change.                                                                                                                    |
| Estimates           |                                                                                                                                                                  |
| Success Message     |                                                                                                                                                                  |
| Error Messages      | (See UC 48 for duplicate name errors)                                                                                                                            |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br />                              |
