
# MERN Assessment Test - Homzly

> **Confidential**

## Technical Assessment  
**Role**: MERN Stack Developer  

---

## Concept

**PropTrack – Real Estate Listings & Client Management Platform**

At PropTrack, we are building a real estate web platform to help agents manage property listings, client inquiries, and scheduled viewings. The platform is designed to streamline the property management workflow while providing users with a smooth and intuitive browsing experience for real estate listings.

The core system revolves around three key entities:

- **Property**: Describes a unit available for sale or rent. Each property includes details such as title, price, type (rent/sale), location, amenities, and images.  
- **Client**: Represents a user who has inquired about a property. A client can have one or more scheduled viewings.  
- **Viewing**: A scheduled time where an agent meets a client for a property showing. Viewings are tracked with date, time, and status.  

---

## User Stories and Functional Requirements

### For the Public Interface:

- View a list of all active properties with pagination  
- Filter and search the property listings by:  
  - Price range  
  - Location  
  - Property type (sale/rent)  
  - Bedrooms, bathrooms, area and amenities  
- Click a property to see full details and an image gallery  
- Submit an inquiry form (which should be stored as a client lead in the system)  

### For the Agent Dashboard:

- Add a new property listing with full details (title, description, price, location, type, images, etc.)  
- Edit, archive, or delete existing properties  
- Filter/search property listings on the dashboard  
- View a list of client inquiries (automatically generated from the public inquiry form)  
- Schedule a viewing for a specific property and client  
- Mark a viewing as completed or a no-show, and add internal notes  

---

## Non-functional Requirements

- Must use the **MERN stack** (MongoDB, Express, React, Node.js)  
- Persist all property data in MongoDB  
  - Apply indexing for performance with 10,000+ listings  
  - Use MongoDB’s aggregation pipeline for filtering and searching  
- Implement **central/shared state** using Redux, Mobx, Zustand, etc.  
  - Do **not** rely solely on `useState` or `useContext`  
  - Design the state to be scalable and maintainable  
- Follow industry-standard development practices:  
  - Use multiple meaningful commits  
  - Treat each commit as a PR-level contribution  

---

## Non-requirements

You do **not** need to implement:

- Authentication or session management  
- Third-party email or chat integrations  
- Real SMS/calendar integrations for viewings  
- Production-grade image hosting (use placeholder/base64 images)  

---

## Bonus Features

- Beautiful UI design  
- Internationalization support  
- Real-time chat between client and agent  
- Map view using Google Maps API or Leaflet.js  
- Any extra features to demonstrate your skills  

---

## Submission Instructions

Upload your work to a **public GitHub repo** with a `README.md` that includes:

- Instructions to run the app from scratch  
- Screenshots of your views (video demo is a bonus)  
- Assumptions made to complete the task  
- Summary of technical choices and rationale  
- Future plans or improvements  
- Stretch goals or bonus features attempted  
- Shortcuts or compromises made  
- Total time spent on the assessment  
- Tools, frameworks, or technologies used  
- Anything else worth sharing  

**Provide the GitHub repo link by replying to the same email thread.**

---

## Evaluation Criteria

We will assess your submission based on:

- Code quality and cleanliness  
- Use of good software design principles  
- Completeness of required features  
- Meaningful and incremental commit history  
- Quality of the README documentation  
- Bonus/stretch features implemented  

---

## Final Thoughts

In real-world projects, requirements evolve and you must make informed decisions. For this assessment:

- Make judgment calls if details are missing  
- Clearly document your decisions/assumptions in the README  
- Treat the requirements as a superset—define an MVP and build a functional, clean, and extensible solution  
- Spend the equivalent of a **single productive working day**  

This is your chance to show how you think and build as a product-minded developer.

---
