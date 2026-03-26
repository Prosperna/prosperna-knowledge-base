---
id: geolocation-auto-assign-store-location-based-on-customers-gps
title: Geolocation Auto Assign Store Location based on Customer's GPS BRD
sidebar_label: Geolocation BRD
sidebar_position: 2
---

# Summary
This document focuses on automatically setting the Store Location based on the Customer's Location upon visiting the Merchant's Store.

---

## Problem Statement
Our current implementation of **Multilocation** enables customers to select the Store Location where they would like to order. However, there is a possibility that a customer might place an order from a store farther from their current location, even though nearby store locations may also have available stock.

---

## Scope
This feature will revolve around the customer allowing access to their location, which will be collected and used to calculate and display the **nearest store location** when the customer enters the Merchant's Store.

- Customers can still change their store location after being automatically redirected, as they might want to order from a different store based on preference or product availability.
- This feature is available to **ALL paid plans (PLUS, PRO, and PREMIUM)**.
  - **Price:** ₱495.00 / Month  
  - This follows the allowable limit for Store Locations that vary per plan.  
  - Since the **FREE** plan allows only one Store Location, store redirection will not be necessary, as it will always be set to the active location.

---

## Comparative Analysis

### Comparison

**Hard-Coded Location Navigator (previously used in myStore)**  
- Previously implemented for Harbour City.
- Prompts for collecting longitude and latitude can be controlled based on the available store locations.
- Dynamically calculates the distance between the customer and the nearest store.
- Allows flexibility for customers to still select a preferred store (e.g., Main Branch or a branch with a specific product).  
✅ *Best approach discussed among developers — cost-effective, accurate, and free to implement (can be monetized in the marketplace).*

**AbstractAPI.io**  
- Ideal for basic geolocation info (city, country, latitude/longitude).  
- Affordable and simple to implement for store redirection.  
🟢 *2nd best option — meets requirements and easy to integrate.*

**IPinfo.io**  
- Suitable for higher precision with added insights (ISP, proxy detection).  
- More accurate but also more expensive.  
🟠 *Useful for VPN/proxy detection, though not all parameters are needed.*

**Ip2location.io**  
- Provides downloadable offline database for faster querying and reduced latency.  
- Cons: Requires maintenance for new locations and has variable accuracy.  

---

## Research References

- [AbstractAPI.io Geolocation API](https://www.abstractapi.com/api/ip-geolocation-api)
- [IPinfo.io](https://ipinfo.io)
- [IP2location.io](https://www.ip2location.io/)
- [Geocoders.io Pricing](https://geocoders.io/#pricing) — *Used by FoodPanda*  
  - Postcode Lookup API: €0.0017/request  
  - Street Lookup API: €0.0023/request

**Developer Docs**
- [AbstractAPI Docs](https://docs.abstractapi.com/ip-geolocation)
- [AbstractAPI Tutorial (YouTube)](https://www.youtube.com/watch?v=KIQShH4b_oQ)

---

## Functional Requirements

| Use Case ID | Actor | Use Case Name | Short Description | Priority |
|--------------|--------|----------------|--------------------|-----------|
| **UC 01** | Prosperna One Merchant | Marketplace: Subscribe to Store Locator: Geolocation | Allows Merchants to subscribe to the Store Locator: Geolocation Feature | HIGH |
| **UC 02** | Prosperna One Merchant | Merchant Side: Multilocation - Add Longitude and Latitude | Allows Merchants to set up their store location coordinates | HIGH |
| **UC 03** | Prosperna One Customer | Customer Side: Redirect User to Nearest Store Location | Automatically redirects customers to the nearest store upon allowing location access | HIGH |

---

## Use Case Descriptions

### UC 01 — Marketplace: Subscribe to Store Locator: Geolocation  
**Business Rules / Desired Behavior**
- Available for **ALL Paid Plans**
- Impacted Modules:
  - Marketplace  
  - Store Settings → Manage Locations  
  - Online Store

---

### UC 02 — Merchant Side: Multilocation - Add Longitude and Latitude  
**Business Rules / Desired Behavior**
- Available for **ALL Paid Plans**  
- “Use My Current Location” button disabled if not subscribed to the Geolocation Feature  
- Redirection prompt should appear once the user enters the Merchant’s Store (valid only if there are 2+ active store locations)  
- Identify impacted modules if missing

---

### UC 03 — Customer Side: Redirect to Nearest Store  
**Business Rules / Desired Behavior**
- Customers must be prompted to allow location access upon visiting a Merchant’s Page  
- Customers can still change store location after automatic redirection  
- Identify impacted modules if missing

---

## Nonfunctional Requirements

| Name | Description | Priority |
|------|--------------|-----------|
| **Responsiveness** | Website must adapt to any screen size without compromising layout | HIGH |
| **System Performance** | System should respond within 3 seconds | HIGH |

---

## Wireframes
[Figma Wireframe Link](https://www.figma.com/design/qBkujzywAdH1pGXcDDV4a9/Wireframe---Jomari?node-id=799-5208&t=xcoaiWDQJW8MTimA-4)

---

## Figma Design File
[Figma Design File – Geolocation Feature](https://www.figma.com/design/OVexQHdGNaitadXy6sXqI7/Geolocation-Auto-Assign-Store-Location-based-on-Customer's-GPS?node-id=0-1&node-type=canvas&t=WubdfKlj9RKiAgN8-0)

---

## ClickUp Task
[ClickUp Task Link](https://app.clickup.com/t/86eqcdduj)

---

## Test Documentation
*(To be added)*

---

## Future Enhancements
*(To be added)*

---

## Sign-Off

| Stakeholder | Role | Status | Date |
|--------------|------|---------|------|
| **Dennis** | CEO |  |  |
| **Ruel** | HoE |  |  |
| **Jomari** | BA | ✅ Completed |  |
| **Christian** | PM |  |  |

---

## Logs

| Name | Action | Description | Date | Related Docs |
|------|---------|--------------|------|---------------|
|  |  |  |  |  |
