# 🧊 FridgeFriend

## *AI-powered smart fridge management, grocery tracking, and recipe generation.*

FridgeFriend is a full-stack mobile application built with **React Native**, **Node.js**, **MongoDB**, and **OpenAI** that helps users reduce food waste, organize groceries, track fridge inventory, and discover personalized recipes powered by AI.

The app intelligently links together your **fridge items**, **grocery list**, and **recipes**, allowing seamless transitions between planning meals, buying ingredients, and cooking efficiently.

---

## ✨ Features

### 🧠 AI-Powered Recipe Generation

FridgeFriend integrates with **OpenAI GPT-4.1** to generate fully structured recipes in JSON format that the app can instantly save, edit, and display.

Three AI modes are available:

* **Use What’s in My Fridge** – Recipes based on your current inventory
* **Random Recipe** – Creative, varied suggestions for inspiration
* **Custom Prompt** – Users can request any type of recipe

Each generated recipe includes:

* Title & description
* Ingredients (quantity, unit, label, notes)
* Steps & instructions
* Tags (e.g., *Quick, Vegan, Dinner, One-Pot*)
* Optional photo URL

Generated recipes are fully editable and stored alongside user-created ones.

---

### 🧺 Grocery List Management

* Add grocery items manually or directly from recipes
* Items include name, quantity, unit, label, brand, notes
* Move purchased items from grocery → fridge
* Unified classification system for units & labels
* Clean, intuitive UI with pill chips and structured editing

---

### 🧊 Smart Fridge Inventory

* Track food stored in your fridge
* Items support:

  * Name
  * Quantity
  * Unit
  * Brand
  * Label/category
  * Expiration date
  * Link to originating grocery item
* Powered by the same unified item editor used across the entire app
* AI uses fridge inventory to propose recipes users can realistically cook

---

### 🧾 Recipe System

* Fully editable recipes with:

  * Title, description, photo
  * Prep time, cook time, total time
  * Structured ingredient list
  * Step-by-step instructions
  * Tags (diet, cooking method, difficulty, meal type, etc.)
* Recipe cards display:

  * Compact chip tags (with smart prioritization)
  * Ingredient availability indicators (fridge, grocery, missing)
  * Time summaries (prep, cook, total)

---

### 🔗 Unified Item Editing System

A single **ItemEditorModal** is used for:

* Grocery items
* Fridge items
* Recipe ingredients

This editor supports:

* Quantity & units
* Note field
* Expiration date (when applicable)
* Category label
* Brand
* Intelligent validation
* Unified UX styling across the whole app

This dramatically reduces duplication and makes the app consistent and scalable.

---

## 🏗️ Tech Stack

### 📱 Frontend (Mobile App)

* **React Native (Expo)**
* **TypeScript**
* **React Navigation**
* **Axios**
* **Ionicons**
* **Custom design system**

Features of the frontend:

* Real-time screens for Fridge, Grocery, and Recipes
* Smooth modals and action sheets
* Unified styling with custom pill and chip components
* Recipe cards with AI-powered metadata

---

### 🖥️ Backend (API Server)

* **Node.js + Express**
* **TypeScript**
* **MongoDB Atlas + Mongoose**
* **JWT authentication**
* **Clean modular architecture**

```
backend/src/
  models/
  controllers/
  routes/
  services/
  dao/
  integrations/
  middleware/
  utils/
  config/
```

Backend capabilities include:

* CRUD for fridge, grocery, recipes
* AI recipe generation engine
* Ingredient availability matching
* Authentication + session handling
* Structured data schemas for consistency

---

### 🤖 AI Integration

Powered by the **OpenAI Chat Completions API** with strict JSON mode:

* Ensures recipe output matches the exact schema
* Forces valid units and labels
* Produces realistic, cookable recipes
* Supports contextual reasoning based on user’s fridge inventory

This makes AI a seamless part of the user experience.

---

## 📂 Project Structure

```
fridgefriend/
  frontend/
    assets/
    src/
      screens/
      components/
      context/
      navigation/
      api/
      utils/
      styles/
    

  backend/
    src/
      routes/
      controllers/
      middleware/
      models/
      services/
      dao/
      integrations/
      utils/
      config/
```

---

## 🎯 Purpose

FridgeFriend was built to solve real everyday problems:

1. **Reduce food waste** – Use what you already have
2. **Save money** – Buy only what you need
3. **Plan meals efficiently** – AI helps decide what to cook
4. **Empower home cooking** – Clear steps and structured ingredients
5. **Keep your kitchen organized** – Unified tracking of fridge + grocery + recipes

The goal is a modern, intelligent personal kitchen assistant.

---

## 🚀 Future Roadmap

* AI meal planning (e.g., “Plan my week of meals”)
* Expiration notifications
* OCR ingredient scanning
* Recipe search & advanced filtering
* Pantry staples tracking
* Cloud syncing across devices

---

## 🧑‍💻 Running the Project

### Backend

```bash
cd backend
npm install
npm run dev
```

Make sure you configure `.env` with:

* `MONGO_URI`
* `JWT_SECRET`
* `OPENAI_API_KEY`

---

### Frontend (Expo)

```bash
cd frontend
npm install
npm start
```

Ensure the API base URL is set correctly in:

```
frontend/src/api/client.ts
```

---

## ❤️ Credits

FridgeFriend combines **mobile UX**, **AI**, and **structured food-management workflows** to create a smart kitchen assistant that helps you cook better, save money, and reduce waste.
