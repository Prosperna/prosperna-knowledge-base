---
id: variant-combination-management-pt2
title: Variant Combination Management Part 2
sidebar_label: Variant Combinations 2
sidebar_position: 6
---

#### **UC 30 | Add Image(s) to a Variant Combination**

| **Field**           | **Description**                                                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 30                                                                                                                                                                                 |
| Prepared By         | BA                                                                                                                                                                                    |
| Last Updated        | September 18, 2025                                                                                                                                                                    |
| Objectives          | The merchant should be able to add one or more images to a variant combination according to their subscription plan limit.                                                            |
| Actor               | Merchant, System                                                                                                                                                                      |
| Preconditions       | A variant combination row exists in the table.                                                                                                                                        |
|                     | The merchant has not yet reached their plan's image limit for the selected variant combination. (Free/Plus: 1, Pro: 3, Premium: 5)                                                    |
| Steps               | 1\. The merchant locates the desired variant combination row and clicks the upload icon in the "Image" column.                                                                        |
|                     | 2\. The system opens the centralized "Media Library" modal. The modal does not show any counters or pre-select any images.                                                            |
|                     | 3\. The merchant selects one or more images, ensuring the total number of new images plus existing images does not exceed their plan's limit.                                         |
|                     | 4\. The merchant clicks the "Select" button in the modal.                                                                                                                             |
|                     | 5\. The system closes the modal.                                                                                                                                                      |
|                     | 6\. The system displays square thumbnail previews for all selected images in the "Image" column for that variant. The upload icon remains visible as a square next to the thumbnails. |
| Postconditions      | The selected images are now associated with the variant combination and displayed as thumbnails.                                                                                      |
| Business Trigger    | The merchant needs to assign specific product shots to each unique variant combination.                                                                                               |
| Acceptance Criteria | Clicking the upload icon opens the Media Library.                                                                                                                                     |
|                     | After selection, thumbnails for the chosen images appear in the "Image" column.                                                                                                       |
|                     | The upload icon remains visible next to the new thumbnails.                                                                                                                           |
| Estimates           |                                                                                                                                                                                       |
| Success Message     |                                                                                                                                                                                       |
| Error Messages      | (See UC 33)                                                                                                                                                                           |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br /><br />                        |

#### **UC 31 | View Full Image on Hover**

| **Field**           | **Description**                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 31                                                                                                                            |
| Prepared By         | BA                                                                                                                               |
| Last Updated        | September 18, 2025                                                                                                               |
| Objectives          | The merchant should be able to see a larger preview of a variant image by hovering over its thumbnail.                           |
| Actor               | Merchant, System                                                                                                                 |
| Preconditions       | At least one image thumbnail is visible in the "Image" column for a variant combination.                                         |
| Steps               | 1\. The merchant moves their cursor and hovers over an image thumbnail.                                                          |
|                     | 2\. The system immediately displays a larger, zoomed-in preview of that image in a modal-like element adjacent to the thumbnail. |
|                     | 3\. The merchant moves their cursor off of the thumbnail.                                                                        |
|                     | 4\. The system immediately closes the zoomed-in preview modal.                                                                   |
| Postconditions      | The merchant has viewed a larger version of the image without leaving the page context.                                          |
| Business Trigger    | The merchant needs to quickly verify the details of a small thumbnail image.                                                     |
| Acceptance Criteria | Hovering over a thumbnail opens the preview modal.                                                                               |
|                     | The modal closes instantly when the cursor is no longer hovering.                                                                |
| Estimates           |                                                                                                                                  |
| Success Message     |                                                                                                                                  |
| Error Messages      |                                                                                                                                  |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br />                              |

#### **UC 32 | Remove an Image from a Variant Combination**

| **Field**           | **Description**                                                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 32                                                                                                                                                                      |
| Prepared By         | BA                                                                                                                                                                         |
| Last Updated        | September 18, 2025                                                                                                                                                         |
| Objectives          | The merchant should be able to remove an image from a variant combination.                                                                                                 |
| Actor               | Merchant, System                                                                                                                                                           |
| Preconditions       | At least one image thumbnail is visible for a variant combination.                                                                                                         |
| Steps               | **Condition 1: Removing a non-featured image**                                                                                                                             |
|                     | 1\. The merchant locates an image thumbnail that is not the first in the sequence.                                                                                         |
|                     | 2\. The merchant clicks the "x" icon located in the top-right corner of that thumbnail.                                                                                    |
|                     | 3\. The system immediately removes the image thumbnail from the "Image" column.                                                                                            |
|                     | **Condition 2: Removing the featured image**                                                                                                                               |
|                     | 1\. The merchant locates the first image thumbnail in the sequence (the featured image).                                                                                   |
|                     | 2\. The merchant clicks the "x" icon on that thumbnail.                                                                                                                    |
|                     | 3\. The system removes the image and automatically designates the next image in the sequence as the new featured image (i.e., it becomes the first thumbnail in the list). |
| Postconditions      | The selected image is disassociated from the variant combination.                                                                                                          |
|                     | If the featured image was removed, a new featured image is assigned.                                                                                                       |
| Business Trigger    | The merchant wants to change the images associated with a specific variant.                                                                                                |
| Acceptance Criteria | Clicking the "x" icon removes the correct image.                                                                                                                           |
|                     | If the featured image is removed, the next image in line becomes the new featured image.                                                                                   |
| Estimates           |                                                                                                                                                                            |
| Success Message     |                                                                                                                                                                            |
| Error Messages      |                                                                                                                                                                            |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br />                              |

#### **UC 33 | Block Adding Images Beyond Plan Limit**

| **Field**           | **Description**                                                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 33                                                                                                                                                                                          |
| Prepared By         | BA                                                                                                                                                                                             |
| Last Updated        | September 18, 2025                                                                                                                                                                             |
| Objectives          | The system should prevent the merchant from selecting more images than their current plan allows.                                                                                              |
| Actor               | System, Merchant                                                                                                                                                                               |
| Preconditions       | A merchant is on a plan with a specific image limit (e.g., Pro with a 3-image limit).                                                                                                          |
|                     | The variant combination already has a number of images attached (e.g., 2 images).                                                                                                              |
| Steps               | 1\. The merchant clicks the upload icon for the variant combination.                                                                                                                           |
|                     | 2\. The Media Library modal opens.                                                                                                                                                             |
|                     | 3\. The merchant selects a number of new images that, when added to the existing images, would exceed the plan limit (e.g., selects 2 new images, for a total of 4, exceeding the limit of 3). |
|                     | 4\. The merchant clicks the "Select" button.                                                                                                                                                   |
|                     | 5\. The system will then:<br />    - Block the action.<br />    - Keep the Media Library modal open.<br />    - Display an error toast: "\[planLimit\] Variant image limit reached."           |
| Postconditions      | No new images are added to the variant combination.                                                                                                                                            |
|                     | The merchant remains in the Media Library modal and can adjust their selection.                                                                                                                |
| Business Trigger    | The system must enforce subscription plan limits.                                                                                                                                              |
| Acceptance Criteria | The save action from the Media Library is blocked.                                                                                                                                             |
|                     | The Media Library modal does not close.                                                                                                                                                        |
|                     | The correct error toast is displayed.                                                                                                                                                          |
| Estimates           |                                                                                                                                                                                                |
| Success Message     |                                                                                                                                                                                                |
| Error Messages      | "\[planLimit\] Variant image limit reached."                                                                                                                                                   |

| **Business Rules/Desired Behavior**                                                 |
| ----------------------------------------------------------------------------------- |
| <br />currentImages<br /><br />newlySelectedImages<br /><br />planLimit<br /><br /> |

#### **UC 34 | Handle Image Limits on Plan Downgrade**

| **Field**           | **Description**                                                                                                                                                                               |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 34                                                                                                                                                                                         |
| Prepared By         | BA                                                                                                                                                                                            |
| Last Updated        | September 18, 2025                                                                                                                                                                            |
| Objectives          | The system should enforce new, lower image limits when a merchant downgrades their plan, while retaining their existing images.                                                               |
| Actor               | System, Merchant                                                                                                                                                                              |
| Preconditions       | A merchant downgrades to a plan with a lower image limit (e.g., from Premium with 5 images to Pro with a 3-image limit).                                                                      |
|                     | The merchant has more images attached to a variant combination than the new limit allows (e.g., 5 images).                                                                                    |
| Steps               | 1\. The merchant's existing 5 images are retained and remain visible as thumbnails in the "Image" column.                                                                                     |
|                     | 2\. The merchant clicks the upload icon to add or replace an image.                                                                                                                           |
|                     | 3\. The Media Library opens. The merchant selects a new image and clicks "Select".                                                                                                            |
|                     | 4\. The system detects that the current image count (5) is already over the new plan limit (3) and blocks the action, displaying an error toast: "\[planLimit\] Variant image limit reached." |
|                     | 5\. The merchant must then manually remove images using the "x" button on the thumbnails until their count is below the new limit (e.g., they delete images until only 2 remain).             |
|                     | 6\. Once the image count is below the limit, the ability to add new images is restored.                                                                                                       |
| Postconditions      | The merchant is prevented from adding or replacing images while over their downgraded plan's limit.                                                                                           |
| Business Trigger    | The system must gracefully handle plan downgrades without causing immediate data loss, while still enforcing new limits.                                                                      |
| Acceptance Criteria | Existing images are retained on downgrade.                                                                                                                                                    |
|                     | Adding/replacing images is blocked while the current count is over the new limit.                                                                                                             |
|                     | The correct error message is displayed.                                                                                                                                                       |
| Estimates           |                                                                                                                                                                                               |
| Success Message     |                                                                                                                                                                                               |
| Error Messages      | "\[planLimit\] Variant image limit reached."                                                                                                                                                  |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br />                              |

#### **UC 35 | Edit Variant Combination Quantity**

| **Field**           | **Description**                                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 35                                                                                                                                                                                        |
| Prepared By         | BA                                                                                                                                                                                           |
| Last Updated        | September 16, 2025                                                                                                                                                                           |
| Objectives          | The merchant should be able to manage stock for a variant across multiple store locations.                                                                                                   |
| Actor               | Merchant, System                                                                                                                                                                             |
| Preconditions       | A variant combination row exists in the table.                                                                                                                                               |
| Steps               | 1\. The merchant locates the desired variant row and clicks the "Add Qty." link in the "Quantity" column.                                                                                    |
|                     | 2\. The system opens the "Multilocation Inventory" modal, which lists all store locations and their current stock for that variant.                                                          |
|                     | 3\. The merchant adjusts the quantity for one or more locations by either:<br />    - Typing a number directly into the "Available Stock" field.<br />    - Clicking the "+" or "-" buttons. |
|                     | 4\. The merchant clicks the "Save" button in the modal.                                                                                                                                      |
|                     | 5\. The system closes the modal, recalculates the total quantity by summing the stock from all locations, and updates the "Quantity" cell in the main table.                                 |
|                     | 6\. The system automatically updates the "Status" column (e.g., to "In Stock" or "Out of Stock") based on the new total quantity.                                                            |
| Postconditions      | The inventory levels for the variant are updated for each location.                                                                                                                          |
|                     | The total quantity and stock status are updated in the main combinations table.                                                                                                              |
| Business Trigger    | The merchant needs to accurately track and manage inventory for each specific variant at different physical locations.                                                                       |
| Acceptance Criteria | The quantity modal opens and correctly displays all store locations.                                                                                                                         |
|                     | Quantity can be adjusted per location.                                                                                                                                                       |
|                     | Clicking "Save" updates the total quantity and status in the main table.                                                                                                                     |
| Estimates           |                                                                                                                                                                                              |
| Success Message     |                                                                                                                                                                                              |
| Error Messages      |                                                                                                                                                                                              |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br /><br />                        |

#### **UC 36 | Edit Variant Combination Dimensions**

| **Field**           | **Description**                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 36                                                                                                            |
| Prepared By         | BA                                                                                                               |
| Last Updated        | September 16, 2025                                                                                               |
| Objectives          | The merchant should be able to set the shipping dimensions for a variant combination.                            |
| Actor               | Merchant, System                                                                                                 |
| Preconditions       | A variant combination row exists in the table.                                                                   |
| Steps               | 1\. The merchant locates the "Dimension" column for the desired variant row.                                     |
|                     | 2\. The system displays numeric input fields for Length (L), Width (W), Height (H), and a dropdown for the unit. |
|                     | 3\. The merchant enters numeric values into the L, W, and H fields.                                              |
|                     | 4\. The merchant selects a unit (e.g., cm, in) from the dropdown menu.                                           |
|                     | 5\. The changes are persisted in the UI, ready to be saved.                                                      |
| Postconditions      | The dimension data for the variant is updated in the page's state.                                               |
| Business Trigger    | The merchant needs to provide accurate dimension information for shipping cost calculations.                     |
| Acceptance Criteria | The L, W, H, and unit fields are all editable.                                                                   |
|                     | The entered values are correctly stored.                                                                         |
| Estimates           |                                                                                                                  |
| Success Message     |                                                                                                                  |
| Error Messages      |                                                                                                                  |

| **Business Rules/Desired Behavior**                                                            |
| ---------------------------------------------------------------------------------------------- |
| <br /><br />The options for the unit dropdown are the following:<br /><br /><br /><br /><br /> |

#### **UC 37 | Edit Variant Combination Weight**

| **Field**           | **Description**                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 37                                                                                           |
| Prepared By         | BA                                                                                              |
| Last Updated        | September 16, 2025                                                                              |
| Objectives          | The merchant should be able to set the shipping weight for a variant combination.               |
| Actor               | Merchant, System                                                                                |
| Preconditions       | A variant combination row exists in the table.                                                  |
| Steps               | 1\. The merchant locates the "Weight" column for the desired variant row.                       |
|                     | 2\. The system displays a numeric input field for the weight value and a dropdown for the unit. |
|                     | 3\. The merchant enters a numeric value into the weight field.                                  |
|                     | 4\. The merchant selects a unit (e.g., g, kg, lb) from the dropdown menu.                       |
|                     | 5\. The changes are persisted in the UI, ready to be saved.                                     |
| Postconditions      | The weight data for the variant is updated in the page's state.                                 |
| Business Trigger    | The merchant needs to provide accurate weight information for shipping cost calculations.       |
| Acceptance Criteria | The weight value and unit fields are editable.                                                  |
|                     | The entered values are correctly stored.                                                        |
| Estimates           |                                                                                                 |
| Success Message     |                                                                                                 |
| Error Messages      |                                                                                                 |

| **Business Rules/Desired Behavior**                                                                        |
| ---------------------------------------------------------------------------------------------------------- |
| <br /><br />The options for the unit dropdown are the following:<br /><br /><br /><br /><br /><br /><br /> |

#### **UC 38 | Edit Variant Combination SKU**

| **Field**           | **Description**                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| Use Case ID         | UC 38                                                                                                           |
| Prepared By         | BA                                                                                                              |
| Last Updated        | September 16, 2025                                                                                              |
| Objectives          | The merchant should be able to set the Stock Keeping Unit (SKU) for a variant combination.                      |
| Actor               | Merchant, System                                                                                                |
| Preconditions       | A variant combination row exists in the table.                                                                  |
| Steps               | 1\. The merchant locates the "SKU" column for the desired variant row.                                          |
|                     | 2\. The merchant clicks into the input field.                                                                   |
|                     | 3\. The merchant types the SKU value (e.g., "TSHIRT-RED-L").                                                    |
|                     | 4\. The change is persisted in the UI, ready to be saved.                                                       |
| Postconditions      | The SKU for the variant is updated in the page's state.                                                         |
| Business Trigger    | The merchant needs to assign a unique internal tracking code to each specific variant for inventory management. |
| Acceptance Criteria | The SKU field is editable.                                                                                      |
|                     | The entered value is correctly stored.                                                                          |
| Estimates           |                                                                                                                 |
| Success Message     |                                                                                                                 |
| Error Messages      |                                                                                                                 |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br />                              |

#### **UC 39 | Edit Variant Combination Price**

| **Field**           | **Description**                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Use Case ID         | UC 39                                                                                                              |
| Prepared By         | BA                                                                                                                 |
| Last Updated        | September 16, 2025                                                                                                 |
| Objectives          | The merchant should be able to set the retail price for a variant combination.                                     |
| Actor               | Merchant, System                                                                                                   |
| Preconditions       | A variant combination row exists in the table.                                                                     |
| Steps               | 1\. The merchant locates the "Price" column for the desired variant row.                                           |
|                     | 2\. The merchant clicks into the numeric input field.                                                              |
|                     | 3\. The merchant types in the price for the variant.                                                               |
|                     | 4\. The system immediately recalculates the "Margin" field in real-time (as per UC 42).                            |
|                     | 5\. The change is persisted in the UI, ready to be saved.                                                          |
| Postconditions      | The price for the variant is updated in the page's state.                                                          |
| Business Trigger    | The merchant needs to set a specific price for each variant, as some variations may be more expensive than others. |
| Acceptance Criteria | The Price field is editable.                                                                                       |
|                     | The entered value is correctly stored.                                                                             |
|                     | The Margin field updates if possible.                                                                              |
| Estimates           |                                                                                                                    |
| Success Message     |                                                                                                                    |
| Error Messages      |                                                                                                                    |

| **Business Rules/Desired Behavior** |
| ----------------------------------- |
| <br /><br />                        |
