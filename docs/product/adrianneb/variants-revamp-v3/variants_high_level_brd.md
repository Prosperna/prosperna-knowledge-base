---
id: variants-v3-brd
title: P1 | Variants V3 High Level BRD
sidebar_label: High Level BRD
sidebar_position: 1
---

# Business Requirements Document (BRD)

### **Executive Summary:**

The revamped Variants feature in Prosperna enhances how merchants manage product variations by automating the generation of possible combinations. Unlike the old manual process, which was time-consuming and error-prone, this new system auto-creates variant combinations (e.g., Size + Color + Material) based on merchant inputs. This improvement helps merchants save time, maintain data integrity, and scale product catalogs more efficiently. By ensuring accurate variant creation and preserving existing data, the feature solves the problem of manual mismanagement while offering a more intuitive and scalable solution.

### **Background:**

Prosperna is an ecommerce platform that lets their merchants sell products/services through their online store website. It recognizes the significance of reducing manual work and improving accuracy when merchants configure product variants. The old variant system required merchants to manually create each possible combination, often leading to incomplete data, wasted effort, and errors. The revamped feature introduces automation, incremental expansion, and validation safeguards that streamline variant management. This ensures merchants can handle complex product configurations without compromising on speed, usability, or accuracy.

### **Competitor Research:**

[https://prosperna.sg.larksuite.com/docx/APo4dXkImoCCm2x0eaFu2vHesJg](https://prosperna.sg.larksuite.com/docx/APo4dXkImoCCm2x0eaFu2vHesJg)

### **Business Objectives:**

- Automate the generation of variant combinations to reduce merchant effort and eliminate errors.
- Preserve existing merchant data during configuration changes to avoid accidental data loss.
- Enforce subscription-based limits (variant types, options, combinations, images) to align with plan tiers and prevent system overload, with soft enforcement on plan downgrades to minimize merchant disruption.
- Improve product data integrity through validations on variant type names, option names, and required fields.
- Enhance merchant efficiency with bulk editing and search tools for variant combinations.
- Provide a scalable and performant architecture capable of handling up to 150 variant combinations per product (plan-dependent: Free: 50, Plus: 100, Pro: 120, Premium: 150).

### **Scope of Solution:**

- Enable and disable variants on a product.
- Add, edit, reorder, and delete variant types and options.
- Auto-generate and auto-delete variant combinations based on changes.
- Incrementally expand combinations when new variant types or options are added.
- Preserve merchant-entered data (Price, SKU, Quantity, etc.) when regenerating combinations.
- Apply display types (Text, Icon, Color Swatch) with plan-specific constraints.
- Enforce validation rules for uniqueness, required fields, and combination/option limits.
- Allow merchants to bulk select and bulk edit multiple combinations.
- Support adding images to variant combinations with subscription plan limits.
- Provide quantity, dimensions, weight, price, sale price, cost, and availability settings for each combination.
- Provide search and inline editing for variant combinations.
- Display warning and error messages when limits or validation failures occur.

### **Out-of-scope:**

- Advanced variant logic such as conditional variants (e.g., dependent options).
- Custom UI themes for variant selection on the storefront (beyond default display types).
- API endpoints for external systems (future scope under Public API).
- Migration of legacy variant data beyond preserving existing combinations in current products.
- Integration with third-party inventory or ERP systems.

### **Business Requirements:**

- The system must auto-generate combinations upon adding variant types/options.
- The system must support incremental expansion while preserving data.
- The system must block saving of incomplete or invalid configurations.
- The system must allow only one "Color Swatch" variant type at a time.
- The system must enforce plan-specific limits (types, options, combinations, images).
- The system must implement soft enforcement on plan downgrades, preserving existing data while preventing additions beyond new limits.
- The system must auto-update stock status and calculate profit margins in real time.
- The system must preserve existing combination data during changes unless explicitly deleted.
- The system must highlight newly added combinations for visibility.
- The system must provide bulk-edit capabilities across selected variants.
- The system must warn merchants when approaching or exceeding combination/option limits.

# Functional Requirements Specification (FRS)

## Use Case List

| **Use Case ID**                           | **Actor**        | **Use Case Name**                                                    | **Short Description**                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------- | ---------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product Variants Activation**           |                  |                                                                      |                                                                                                                                                                                                                                                                                                                                     |
| **UC 01**                                 | Merchant, System | Enable Variants                                                      | The merchant should be able to enable the variants feature for a product for the first time.                                                                                                                                                                                                                                        |
| **UC 02**                                 | Merchant, System | Disable Variants                                                     | The merchant should be able to disable the variants feature of a product.                                                                                                                                                                                                                                                           |
| **UC 03**                                 | System, Merchant | Block Saving Product with Variants Enabled But No Combinations       | The system should block any saving attempts on a product when the variants feature is enabled but no valid variant combinations have been generated.                                                                                                                                                                                |
| **Variant Type Management**               |                  |                                                                      |                                                                                                                                                                                                                                                                                                                                     |
| **UC 04**                                 | Merchant, System | Add a New Variant Type                                               | The merchant should be able to add a new variant type card to the configuration.                                                                                                                                                                                                                                                    |
| **UC 05**                                 | Merchant, System | Add a Color Swatch-Based Variant Type                                | The merchant should be able to designate a variant type for "Color Swatch", enabling a color picker for its options.                                                                                                                                                                                                                |
| **UC 06**                                 | Merchant, System | Add an Icon-Based Variant Type                                       | The merchant should be able to designate a variant type for "Icon" and select an image for each option.                                                                                                                                                                                                                             |
| **UC 07**                                 | Merchant, System | Delete a Variant Type                                                | The merchant should be able to delete a variant type.                                                                                                                                                                                                                                                                               |
| **UC 08**                                 | Merchant, System | Block Adding Variant Type when Type Limit is Reached                 | The system should block any attempts to add a Variant Type when the number of existing variant types has already reached the limit according to the merchant's subscription plan.                                                                                                                                                   |
| **UC 09**                                 | System, Merchant | Block Saving with Null Variant Type Name                             | The system should prevent saving the variant configuration if a variant type's name is empty. The system should not auto-exclude the variant type or its combinations, but instead preserve them until the merchant explicitly deletes the type.                                                                                    |
| **UC 10**                                 | System, Merchant | Block Saving with Duplicate Variant Type Names                       | The system should prevent saving the configuration if two or more variant types have the same name. The system should not discard any existing combinations or data, but instead call out the duplicates with inline validation until corrected.                                                                                    |
| **UC 11a**                                | Merchant, System | Expand Combinations on Adding a New Variant Type (Preferred)         | The system should incrementally expand existing combinations to include a newly added variant type and its options, while preserving existing combination data.                                                                                                                                                                     |
| **UC 11b**                                | Merchant, System | Reset Combinations on Adding a New Variant Type (Fallback)           | The system should reset and regenerate all combinations, discarding existing combination data, when adding a new variant type. This is the fallback approach if incremental expansion proves too risky to implement.                                                                                                                |
| **UC 12**                                 | Merchant, System | Warn Merchant when Deleting a Populated Variant Type                 | The system should warn the merchant before they delete a variant type that contains a name or options.                                                                                                                                                                                                                              |
| **UC 13**                                 | System, Merchant | Block Enabling Multiple Color Swatch Display Types                   | The system should enforce that only one variant type can be designated for "Color Swatch" at a time.                                                                                                                                                                                                                                |
| **Variant Option Management**             |                  |                                                                      |                                                                                                                                                                                                                                                                                                                                     |
| **UC 14**                                 | Merchant, System | Add a New Variant Option                                             | The merchant should be able to add a new option to a variant type.                                                                                                                                                                                                                                                                  |
| **UC 15**                                 | Merchant, System | Delete a Variant Option                                              | The merchant should be able to delete a variant option.                                                                                                                                                                                                                                                                             |
| **UC 16**                                 | Merchant, System | Reorder Variant Options                                              | The merchant should be able to change the display order of options within a variant type.                                                                                                                                                                                                                                           |
| **UC 17**                                 | System, Merchant | Block Adding Variant Option when Option Limit is Reached             | The system should prevent the merchant from adding more options than allowed by their subscription plan to a single variant type.                                                                                                                                                                                                   |
| **UC 18**                                 | System, Merchant | Block Adding Variant Option when Combination Limit is Almost Reached | The system should strictly enforce the combination limit according to the merchant's subscription plan by controlling whether the empty placeholder option field appears. A placeholder should only appear if adding another option to that specific variant type would keep the total possible combinations within the plan limit. |
| **UC 19**                                 | System, Merchant | Block Saving with Null Variant Option Name                           | The system should prevent saving the variant configuration if a variant option's name is empty. The system should not auto-exclude the option or discard its associated combinations, but instead call out the empty field with inline validation until the merchant either corrects or deletes the option explicitly.              |
| **UC 20**                                 | System, Merchant | Block Saving with Duplicate Variant Option Names                     | The system should prevent saving the configuration if two or more options within the same variant type have the same name. The system should not discard any combinations or data, but instead call out the duplicates with inline validation until corrected or the option is explicitly deleted.                                  |
| **UC 21**                                 | System, Merchant | Block Saving with Missing Images for Icon Display Type               | The system should prevent saving the variant configuration if a variant type has its Display Type set to "Icon" but one or more options are missing an image. The system should provide inline validation until the merchant either adds the missing images or deletes the incomplete options.                                      |
| **UC 22**                                 | Merchant, System | Warn Merchant when Deleting a Populated Variant Option               | The system should warn the merchant before they delete a variant option that has a name.                                                                                                                                                                                                                                            |
| **Variant Combination Management Part 1** |                  |                                                                      |                                                                                                                                                                                                                                                                                                                                     |
| **UC 23**                                 | System           | Auto-Generate Variant Combinations                                   | The system should automatically create and display all possible variant combinations based on the defined types and options.                                                                                                                                                                                                        |
| **UC 24**                                 | System           | Auto-Delete Variant Combinations                                     | The system should automatically remove variant combinations that are no longer possible due to a change in configuration.                                                                                                                                                                                                           |
| **UC 25**                                 | System           | Preserve Existing Data on Combination Regeneration                   | The system should maintain saved data for variant combinations that persist through a configuration change.                                                                                                                                                                                                                         |
| **UC 26**                                 | System           | Highlight Newly Generated Variant Combinations                       | The system should temporarily highlight newly created variant combination rows to provide visual feedback.                                                                                                                                                                                                                          |
| **UC 27**                                 | Merchant, System | Search Variant Combinations                                          | The merchant should be able to filter the variant combinations list to find specific variants.                                                                                                                                                                                                                                      |
| **UC 28**                                 | Merchant, System | Bulk-Select Variant Combinations                                     | The merchant should be able to select multiple or all variant combinations to perform a bulk action.                                                                                                                                                                                                                                |
| **UC 29**                                 | Merchant, System | Edit Variant Combination Name                                        | The merchant should be able to edit the name of an individual variant combination.                                                                                                                                                                                                                                                  |
| **Variant Combination Management Part 2** |                  |                                                                      |                                                                                                                                                                                                                                                                                                                                     |
| **UC 30**                                 | Merchant, System | Add Image(s) to a Variant Combination                                | The merchant should be able to add one or more images to a variant combination according to their subscription plan limit.                                                                                                                                                                                                          |
| **UC 31**                                 | Merchant, System | View Full Image on Hover                                             | The merchant should be able to see a larger preview of a variant image by hovering over its thumbnail.                                                                                                                                                                                                                              |
| **UC 32**                                 | Merchant, System | Remove an Image from a Variant Combination                           | The merchant should be able to remove an image from a variant combination.                                                                                                                                                                                                                                                          |
| **UC 33**                                 | System, Merchant | Block Adding Images Beyond Plan Limit                                | The system should prevent the merchant from selecting more images than their current plan allows.                                                                                                                                                                                                                                   |
| **UC 34**                                 | System, Merchant | Handle Image Limits on Plan Downgrade                                | The system should enforce new, lower image limits when a merchant downgrades their plan, while retaining their existing images.                                                                                                                                                                                                     |
| **UC 35**                                 | Merchant, System | Edit Variant Combination Quantity                                    | The merchant should be able to manage stock for a variant across multiple store locations.                                                                                                                                                                                                                                          |
| **UC 36**                                 | Merchant, System | Edit Variant Combination Dimensions                                  | The merchant should be able to set the shipping dimensions for a variant combination.                                                                                                                                                                                                                                               |
| **UC 37**                                 | Merchant, System | Edit Variant Combination Weight                                      | The merchant should be able to set the shipping weight for a variant combination.                                                                                                                                                                                                                                                   |
| **UC 38**                                 | Merchant, System | Edit Variant Combination SKU                                         | The merchant should be able to set the Stock Keeping Unit (SKU) for a variant combination.                                                                                                                                                                                                                                          |
| **UC 39**                                 | Merchant, System | Edit Variant Combination Price                                       | The merchant should be able to set the retail price for a variant combination.                                                                                                                                                                                                                                                      |
| **Variant Combination Management Part 3** |                  |                                                                      |                                                                                                                                                                                                                                                                                                                                     |
| **UC 40**                                 | Merchant, System | Edit Variant Combination Sale Price                                  | The merchant should be able to set a sale price for a variant combination.                                                                                                                                                                                                                                                          |
| **UC 41**                                 | Merchant, System | Edit Variant Combination Unit Cost                                   | The merchant should be able to enter the unit cost for a variant combination to track profitability.                                                                                                                                                                                                                                |
| **UC 42**                                 | System           | Auto-Calculate Variant Combination Margin                            | The system should automatically calculate and display the profit margin for a variant combination based on a specific hierarchy of price fields.                                                                                                                                                                                    |
| **UC 43**                                 | Merchant, System | Toggle Variant Combination Availability                              | The merchant should be able to make an individual variant combination available or unavailable for sale.                                                                                                                                                                                                                            |
| **UC 44**                                 | Merchant, System | Bulk Edit Variant Combinations                                       | The merchant should be able to efficiently edit common fields for multiple selected variants at once.                                                                                                                                                                                                                               |
| **UC 45**                                 | System, Merchant | Block Saving with Null Required Fields in Variant Combinations       | The system should prevent saving if any variant combination is missing required data.                                                                                                                                                                                                                                               |
| **UC 46**                                 | System, Merchant | Block Saving with Duplicate Names in Variant Combinations            | The system should prevent saving if multiple variant combinations have the same name.                                                                                                                                                                                                                                               |
| **UC 47**                                 | System, Merchant | Block Saving with Duplicate SKUs in Variant Combinations             | The system should prevent saving if multiple variant combinations have the same non-empty SKU.                                                                                                                                                                                                                                      |
| **UC 48**                                 | System, Merchant | Block Saving when Sale Price is Higher than Regular Price            | The system should validate that for every variant combination, the Sale Price must be strictly lower than the Regular Price. If a variant has a Sale Price higher than or equal to its Regular Price, the system must block saving and display inline validation.                                                                   |
| **UC 49**                                 | Merchant, System | Block Saving when Variant Type has Name but No Options               | The system should be able to block any saving attempts on a Variant Type when a Variant Type Name has been entered but no options were added (placeholder option field remains untouched).                                                                                                                                          |
| **UC 50**                                 | System, Merchant | Handle Plan Downgrade with Soft Enforcement                          | The system should implement soft enforcement when a merchant downgrades their plan, preserving existing variant data that exceeds new limits while preventing new additions beyond the downgraded limits.                                                                                                                           |
| **UC 51**                                 | System, Merchant | Prevent Data Loss from Unsaved Changes                               | The system should prevent the merchant from accidentally losing unsaved changes.                                                                                                                                                                                                                                                    |

# User Interface (UI) Mockup

Variants V3 High-Fidelity Wireframe:<br />
[https://www.figma.com/design/mU0Pn4d7Hqh5QTqjJCrnyc/Variant-Combination-Enhancements?node-id=296-9077&t=YyfCaDzIHbtE5SzN-4](https://www.figma.com/design/mU0Pn4d7Hqh5QTqjJCrnyc/Variant-Combination-Enhancements?node-id=296-9077&t=YyfCaDzIHbtE5SzN-4)<br />
Variants V3 UI Prototype:<br />
[https://www.figma.com/proto/mU0Pn4d7Hqh5QTqjJCrnyc?page-id=0%3A1&node-id=296-9080&t=5svsZ3hSL3NRBz5k-0&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=296%3A9080&fuid=1034290835874621311](https://www.figma.com/proto/mU0Pn4d7Hqh5QTqjJCrnyc?page-id=0%3A1&node-id=296-9080&t=5svsZ3hSL3NRBz5k-0&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=296%3A9080&fuid=1034290835874621311)<br />
Variants V3 Logic Prototype:<br />
[https://p1-ba-pocs.vercel.app/variants-v3](https://p1-ba-pocs.vercel.app/variants-v3)<br />

# Non-Functional Requirements Specification (NFRS)

1. **Performance**: Must generate variant combinations within plan limits (up to 150 for Premium) in less than 1 second.
2. **Scalability**: Must support thousands of products with variants per merchant without database performance degradation.
3. **Data Integrity**: All saved variants must include required fields (Name, Price, Dimensions, Weight).
4. **Usability**: Provide inline validation, tooltips, and visual feedback for errors/warnings.
5. **Reliability**: Ensure data persistence on save and prevent silent data loss during configuration changes.
6. **Security**: Enforce access control so only authorized merchants can edit their variants.
7. **Cross-Platform Support**: Must function consistently across browsers (Chrome, Firefox, Safari, Edge) and devices.

# Test Plan

1. **Unit Testing** – Validation functions, auto-generation logic, and data persistence.
2. **Integration Testing** – Interaction between variant configuration, database, and storefront display.
3. **UI/UX Testing** – Validation errors, inline highlights, and search/bulk-edit usability.
4. **Performance Testing** – Stress test with max combination and option limits.
5. **Regression Testing** – Ensure old product configurations remain unaffected after rollout.
6. **UAT (User Acceptance Testing)** – Validate with merchants to confirm usability and correctness.
7. **Cross-Browser/Device Testing** – Verify feature responsiveness and behavior across supported devices.

# Change Request Log

| **Name** | **Action** | **Use Case** | **Reason** | **Date** | **Related Docs** |
| -------- | ---------- | ------------ | ---------- | -------- | ---------------- |
|          |            |              |            |          |                  |

# Signed Off

| **Stakeholder**   | **Role** | **Status** | **Date Signed**  |
| ----------------- | -------- | ---------- | ---------------- |
| Dennis Velasco    | CEO      |            |                  |
| Ruel Nopal        | HoE      |            |                  |
| Rian Froille Alde | QA       |            |                  |
| Sonny Lozano      | BE       |            |                  |
| Sonny Lozano      | FE       |            |                  |
| Adrianne Berida   | BA       | Completed  | October 29, 2025 |

# For Future Considerations:

1.
